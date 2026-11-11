"""
Gravação de eventos no IBM Cloudant.

Bancos:
  - shetech_analises  → eventos do Guardião (análises de mensagem/imagem/áudio)
  - shetech_bbdecision → eventos do BB Decision (simulações financeiras)

Responsabilidades:
  - Conectar à instância Cloudant usando autenticação IAM (singleton).
  - Gravar documentos mínimos sem PII após cada evento relevante.
  - Usar o ID do evento como _id para garantir idempotência.
  - Falhar silenciosamente — nunca bloqueia a resposta ao app móvel.

Documentos gravados (sem dados pessoais nem conteúdo analisado):

  Guardião (shetech_analises):
  {
    "_id": "<event_id>", "schema_version": 1,
    "occurred_at": "...", "input_channel": "text|image|audio",
    "language_profile": "standard|low",
    "risk_label": "baixo|médio|alto", "risk_score": 42.5,
    "requires_intervention": false, "requires_human_review": false,
    "source": "guardiao-v1"
  }

  BB Decision (shetech_bbdecision):
  {
    "_id": "<event_id>", "schema_version": 1,
    "occurred_at": "...", "scenario_type": "parcelamento|...",
    "language_profile": "standard|low",
    "clarification_needed": false, "has_warnings": true,
    "warnings_count": 2, "user_id_sqlite": 42,
    "source": "bbdecision-v1"
  }

Ativação:
  CLOUDANT_ENABLED=true no .env
  CLOUDANT_URL=https://<guid>-bluemix.cloudantnosqldb.appdomain.cloud
  CLOUDANT_APIKEY=<sua-apikey-iam>
  CLOUDANT_DB=shetech_analises
  CLOUDANT_DB_BBDECISION=shetech_bbdecision

Segurança:
  - Credenciais lidas apenas de variáveis de ambiente.
  - Nunca registradas em log.
  - Conteúdo das mensagens e dados financeiros nunca incluídos nos documentos.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone
from typing import Any

logger = logging.getLogger(__name__)

# Cliente Cloudant singleton — inicializado na primeira chamada se ativo.
_cloudant_client = None
_cloudant_ready: bool | None = None   # None = ainda não testado


def _get_client():
    """
    Retorna (ou inicializa) o cliente Cloudant.

    Retorna None se a integração estiver desativada ou se a lib não estiver
    instalada — sem lançar exceções.
    """
    global _cloudant_client, _cloudant_ready

    # Já tentamos inicializar antes — retorna o resultado cacheado.
    if _cloudant_ready is not None:
        return _cloudant_client if _cloudant_ready else None

    from app.config import settings  # importação tardia — evita ciclo

    # Integração desativada explicitamente ou variáveis não preenchidas.
    if not settings.cloudant_enabled:
        logger.info("Cloudant: integração desativada (CLOUDANT_ENABLED=false)")
        _cloudant_ready = False
        return None

    if not settings.cloudant_url or not settings.cloudant_apikey:
        logger.warning(
            "Cloudant: CLOUDANT_URL ou CLOUDANT_APIKEY não configuradas — "
            "gravação desativada."
        )
        _cloudant_ready = False
        return None

    try:
        from ibmcloudant.cloudant_v1 import CloudantV1
        from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

        authenticator = IAMAuthenticator(settings.cloudant_apikey)
        client = CloudantV1(authenticator=authenticator)
        client.set_service_url(settings.cloudant_url)
        # Timeout curto: não queremos atrasar a resposta ao app
        client.set_http_client(
            client.get_http_client()  # reutiliza default; timeout definido por chamada
        )
        _cloudant_client = client
        _cloudant_ready = True
        logger.info(
            "Cloudant: cliente inicializado (db=%s)", settings.cloudant_db
        )
        return _cloudant_client

    except ImportError:
        logger.warning(
            "Cloudant: biblioteca 'ibmcloudant' não instalada — "
            "gravação desativada. Execute: pip install ibmcloudant"
        )
        _cloudant_ready = False
        return None
    except Exception as exc:
        logger.error(
            "Cloudant: falha ao inicializar cliente (%s) — gravação desativada.",
            type(exc).__name__,
        )
        _cloudant_ready = False
        return None


def store_analysis_event(
    *,
    event_id: str,
    input_channel: str,
    language_profile: str,
    risk_label: str,
    risk_score: float,
    requires_intervention: bool,
    requires_human_review: bool,
) -> None:
    """
    Grava um evento de análise no Cloudant de forma idempotente e silenciosa.

    O `event_id` é usado como `_id` do documento. Se o documento já existir,
    ele é atualizado com os mesmos dados (upsert via get→put). Qualquer falha
    é capturada e logada sem interromper o fluxo principal.

    Args:
        event_id:              ID único e estável do evento (gerado antes da chamada).
        input_channel:         Canal de entrada ("text", "image", "audio").
        language_profile:      Perfil de linguagem ("standard", "low").
        risk_label:            Classificação de risco ("baixo", "médio", "alto").
        risk_score:            Score de risco (0–100).
        requires_intervention: Se a análise gerou intervenção.
        requires_human_review: Se a análise requer revisão humana.
    """
    client = _get_client()
    if client is None:
        return  # integração desativada — fluxo normal

    from app.config import settings

    doc: dict[str, Any] = {
        "_id": event_id,
        "schema_version": 1,
        "occurred_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "input_channel": input_channel,
        "language_profile": language_profile,
        "risk_label": risk_label,
        "risk_score": risk_score,
        "requires_intervention": requires_intervention,
        "requires_human_review": requires_human_review,
        "source": "guardiao-v1",
    }

    try:
        db = settings.cloudant_db

        # Tenta buscar _rev existente para fazer update em vez de criar duplicata.
        rev: str | None = None
        try:
            existing = client.get_document(
                db=db, doc_id=event_id
            ).get_result()
            rev = existing.get("_rev")
        except Exception:
            pass  # documento não existe ainda — primeira gravação

        if rev:
            doc["_rev"] = rev

        client.put_document(db=db, doc_id=event_id, document=doc)
        logger.debug("Cloudant: evento gravado (id=%s)", event_id)

  

    except Exception as exc:
        status = getattr(exc, "code", None)
        logger.warning(
            "Cloudant: falha ao gravar evento (%s, HTTP=%s) — análise entregue normalmente.",
            type(exc).__name__,
            status if isinstance(status, int) else "indisponível",
        )


def _upsert_document(client, db: str, doc_id: str, doc: dict) -> None:
    """Grava ou atualiza um documento no banco especificado (upsert idempotente)."""
    rev: str | None = None
    try:
        existing = client.get_document(db=db, doc_id=doc_id).get_result()
        rev = existing.get("_rev")
    except Exception:
        pass  # documento não existe — primeira gravação
    if rev:
        doc["_rev"] = rev
    client.put_document(db=db, doc_id=doc_id, document=doc)


def store_simulation_event(
    *,
    event_id: str,
    scenario_type: str,
    language_profile: str,
    clarification_needed: bool,
    has_warnings: bool,
    warnings_count: int,
    user_id_sqlite: int | None,
) -> None:
    """
    Grava um evento de simulação BB Decision no banco shetech_bbdecision.

    Mesma semântica de store_analysis_event: idempotente, silencioso,
    sem PII, sem conteúdo da pergunta original.

    Args:
        event_id:             ID único estável do evento.
        scenario_type:        Cenário detectado ("parcelamento", "perda_renda", etc.).
        language_profile:     Perfil de linguagem ("standard", "low").
        clarification_needed: Se a simulação precisou de clarificação.
        has_warnings:         Se a resposta contém avisos.
        warnings_count:       Número de avisos retornados.
        user_id_sqlite:       ID inteiro do usuário no SQLite (None se anônimo).
    """
    client = _get_client()
    if client is None:
        return

    from app.config import settings

    doc: dict[str, Any] = {
        "_id": event_id,
        "schema_version": 1,
        "occurred_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "scenario_type": scenario_type,
        "language_profile": language_profile,
        "clarification_needed": clarification_needed,
        "has_warnings": has_warnings,
        "warnings_count": warnings_count,
        "user_id_sqlite": user_id_sqlite,
        "source": "bbdecision-v1",
    }

    try:
        db = settings.cloudant_db_bbdecision
        _upsert_document(client, db, event_id, doc)
        logger.debug("Cloudant: simulação gravada (id=%s, db=%s)", event_id, db)
    except Exception as exc:
        http_status = getattr(exc, "code", None)
        logger.warning(
            "Cloudant: falha ao gravar simulação (%s, HTTP=%s) — simulação entregue normalmente.",
            type(exc).__name__,
            http_status if isinstance(http_status, int) else "indisponível",
        )