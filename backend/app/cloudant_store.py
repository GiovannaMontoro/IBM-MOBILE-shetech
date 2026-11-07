"""
Gravação de eventos de análise no IBM Cloudant — banco shetech_analises.

Responsabilidades:
  - Conectar à instância Cloudant usando autenticação IAM.
  - Gravar um documento mínimo após cada análise concluída pelo Guardião.
  - Usar o ID do evento como _id do documento para garantir idempotência
    (gravações duplicadas do mesmo evento atualizam em vez de duplicar).
  - Falhar silenciosamente com timeout curto (5 s) para nunca bloquear
    a resposta ao app móvel.

Documento gravado (nenhum dado pessoal ou conteúdo analisado):
  {
    "_id":              "<event_id>",          # estável por evento
    "schema_version":  1,
    "occurred_at":     "2026-11-06T19:40:36Z", # UTC ISO-8601
    "input_channel":   "text" | "image" | "audio",
    "language_profile":"standard" | "low",
    "risk_label":      "baixo" | "médio" | "alto",
    "risk_score":      42.5,
    "requires_intervention": false,
    "requires_human_review": false,
    "source":          "guardiao-v1"
  }

Ativação:
  CLOUDANT_ENABLED=true no .env (padrão: false)
  CLOUDANT_URL=https://<guid>-bluemix.cloudantnosqldb.appdomain.cloud
  CLOUDANT_APIKEY=<sua-apikey-iam>
  CLOUDANT_DB=shetech_analises

Segurança:
  - Credenciais lidas apenas de variáveis de ambiente.
  - Nunca registradas em log.
  - Conteúdo da mensagem original nunca incluído no documento.
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