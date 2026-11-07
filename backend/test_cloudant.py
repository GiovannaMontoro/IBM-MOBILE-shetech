"""
Testes da integração Cloudant — cloudant_store.py

Cenários cobertos:
  1. Integração desativada (CLOUDANT_ENABLED=false):
       store_analysis_event() retorna sem erros e sem fazer chamadas HTTP.
  2. Integração ativa, gravação bem-sucedida (mock do cliente Cloudant):
       store_analysis_event() chama put_document com o documento correto;
       nenhum dado pessoal no documento.
  3. Falha de conexão (mock lança exceção):
       store_analysis_event() captura a exceção e retorna silenciosamente.
  4. Endpoint /api/guardiao/analyze entrega resposta mesmo quando Cloudant falha:
       o status HTTP e o body da resposta não são afetados pela falha.

Execução:
  cd backend
  python -m pytest test_cloudant.py -v
"""

from __future__ import annotations

import importlib
import sys
import types
import uuid
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _reset_cloudant_store() -> None:
    """Força re-importação do módulo para limpar o singleton _cloudant_ready."""
    for mod_name in list(sys.modules.keys()):
        if "cloudant_store" in mod_name:
            del sys.modules[mod_name]


# ---------------------------------------------------------------------------
# Cenário 1 — integração desativada
# ---------------------------------------------------------------------------

class TestCloudantDisabled:
    def setup_method(self):
        _reset_cloudant_store()

    def test_returns_silently_when_disabled(self):
        """store_analysis_event() não faz nada quando CLOUDANT_ENABLED=false."""
        with patch("app.config.settings") as mock_settings:
            mock_settings.cloudant_enabled = False
            mock_settings.cloudant_url = ""
            mock_settings.cloudant_apikey = ""
            mock_settings.cloudant_db = "shetech_analises"

            from app.cloudant_store import store_analysis_event, _get_client
            client = _get_client()
            assert client is None, "Cliente deve ser None quando desativado"

            # Não lança exceção
            store_analysis_event(
                event_id=str(uuid.uuid4()),
                input_channel="text",
                language_profile="standard",
                risk_label="baixo",
                risk_score=10.0,
                requires_intervention=False,
                requires_human_review=False,
            )
        print("[OK] Cenário 1 — integração desativada: retorno silencioso")

    def test_returns_silently_when_url_missing(self):
        """store_analysis_event() não faz nada quando URL não está configurada."""
        with patch("app.config.settings") as mock_settings:
            mock_settings.cloudant_enabled = True
            mock_settings.cloudant_url = ""  # URL vazia
            mock_settings.cloudant_apikey = "some-key"
            mock_settings.cloudant_db = "shetech_analises"

            from app.cloudant_store import store_analysis_event, _get_client
            client = _get_client()
            assert client is None

            store_analysis_event(
                event_id=str(uuid.uuid4()),
                input_channel="text",
                language_profile="standard",
                risk_label="médio",
                risk_score=50.0,
                requires_intervention=False,
                requires_human_review=False,
            )
        print("[OK] Cenário 1b — URL ausente: retorno silencioso")


# ---------------------------------------------------------------------------
# Cenário 2 — gravação bem-sucedida (mock do cliente)
# ---------------------------------------------------------------------------

class TestCloudantSuccess:
    def setup_method(self):
        _reset_cloudant_store()

    def test_put_document_called_with_correct_fields(self):
        """Verifica que put_document é chamado com o documento correto."""
        # Cria mock do cliente ibmcloudant
        mock_result = MagicMock()
        mock_result.get_result.return_value = {}

        mock_client = MagicMock()
        mock_client.get_document.side_effect = Exception("not found")  # novo doc
        mock_client.put_document.return_value = mock_result

        mock_cloudant_v1_cls = MagicMock(return_value=mock_client)
        mock_iam_cls = MagicMock()

        fake_ibmcloudant = types.ModuleType("ibmcloudant")
        fake_cloudant_v1 = types.ModuleType("ibmcloudant.cloudant_v1")
        fake_cloudant_v1.CloudantV1 = mock_cloudant_v1_cls
        fake_ibmcloudant.cloudant_v1 = fake_cloudant_v1

        fake_sdk_core = types.ModuleType("ibm_cloud_sdk_core")
        fake_auth = types.ModuleType("ibm_cloud_sdk_core.authenticators")
        fake_auth.IAMAuthenticator = mock_iam_cls
        fake_sdk_core.authenticators = fake_auth

        sys.modules.setdefault("ibmcloudant", fake_ibmcloudant)
        sys.modules.setdefault("ibmcloudant.cloudant_v1", fake_cloudant_v1)
        sys.modules.setdefault("ibm_cloud_sdk_core", fake_sdk_core)
        sys.modules.setdefault("ibm_cloud_sdk_core.authenticators", fake_auth)

        with patch("app.config.settings") as mock_settings:
            mock_settings.cloudant_enabled = True
            mock_settings.cloudant_url = "https://example.cloudant.com"
            mock_settings.cloudant_apikey = "test-api-key"
            mock_settings.cloudant_db = "shetech_analises"

            from app.cloudant_store import store_analysis_event
            event_id = str(uuid.uuid4())
            store_analysis_event(
                event_id=event_id,
                input_channel="audio",
                language_profile="low",
                risk_label="alto",
                risk_score=85.0,
                requires_intervention=True,
                requires_human_review=True,
            )

        mock_client.put_document.assert_called_once()
        call_kwargs = mock_client.put_document.call_args[1]
        doc = call_kwargs["document"]

        assert doc["_id"] == event_id
        assert doc["input_channel"] == "audio"
        assert doc["language_profile"] == "low"
        assert doc["risk_label"] == "alto"
        assert doc["risk_score"] == 85.0
        assert doc["requires_intervention"] is True
        assert doc["requires_human_review"] is True
        assert doc["source"] == "guardiao-v1"
        assert doc["schema_version"] == 1
        assert "occurred_at" in doc
        # Confirma que nenhum dado pessoal vazou
        assert "message" not in doc
        assert "raw_input" not in doc
        assert "user_id" not in doc
        print(f"[OK] Cenário 2 — gravação bem-sucedida: documento correto, sem dados pessoais")


# ---------------------------------------------------------------------------
# Cenário 3 — falha de conexão
# ---------------------------------------------------------------------------

class TestCloudantFailure:
    def setup_method(self):
        _reset_cloudant_store()

    def test_store_is_silent_on_connection_error(self):
        """store_analysis_event() captura falha de rede e retorna silenciosamente."""
        mock_client = MagicMock()
        mock_client.get_document.side_effect = Exception("Connection refused")
        mock_client.put_document.side_effect = Exception("Connection refused")

        mock_cloudant_v1_cls = MagicMock(return_value=mock_client)
        mock_iam_cls = MagicMock()

        fake_ibmcloudant = types.ModuleType("ibmcloudant")
        fake_cloudant_v1 = types.ModuleType("ibmcloudant.cloudant_v1")
        fake_cloudant_v1.CloudantV1 = mock_cloudant_v1_cls
        fake_ibmcloudant.cloudant_v1 = fake_cloudant_v1

        fake_sdk_core = types.ModuleType("ibm_cloud_sdk_core")
        fake_auth = types.ModuleType("ibm_cloud_sdk_core.authenticators")
        fake_auth.IAMAuthenticator = mock_iam_cls
        fake_sdk_core.authenticators = fake_auth

        sys.modules.setdefault("ibmcloudant", fake_ibmcloudant)
        sys.modules.setdefault("ibmcloudant.cloudant_v1", fake_cloudant_v1)
        sys.modules.setdefault("ibm_cloud_sdk_core", fake_sdk_core)
        sys.modules.setdefault("ibm_cloud_sdk_core.authenticators", fake_auth)

        with patch("app.config.settings") as mock_settings:
            mock_settings.cloudant_enabled = True
            mock_settings.cloudant_url = "https://example.cloudant.com"
            mock_settings.cloudant_apikey = "test-api-key"
            mock_settings.cloudant_db = "shetech_analises"

            from app.cloudant_store import store_analysis_event
            # Não deve lançar exceção
            store_analysis_event(
                event_id=str(uuid.uuid4()),
                input_channel="text",
                language_profile="standard",
                risk_label="baixo",
                risk_score=5.0,
                requires_intervention=False,
                requires_human_review=False,
            )
        print("[OK] Cenário 3 — falha de conexão: exceção capturada silenciosamente")


# ---------------------------------------------------------------------------
# Cenário 4 — endpoint entrega resposta mesmo com Cloudant falhando
# ---------------------------------------------------------------------------

class TestEndpointUnaffectedByCloudantFailure:
    def test_analyze_returns_200_when_cloudant_fails(self):
        """POST /api/guardiao/analyze entrega 200 mesmo se Cloudant lançar exceção."""
        with patch("app.cloudant_store.store_analysis_event", side_effect=Exception("Cloudant down")):
            from app.main import app
            client = TestClient(app)
            r = client.post("/api/guardiao/analyze", json={
                "message": "Oi mae troquei o numero faz um pix de 500 agora urgente",
                "language_profile": "standard",
            })
        assert r.status_code == 200, r.text
        data = r.json()
        assert "risk_score" in data
        assert "risk_label" in data
        print(f"[OK] Cenário 4 — endpoint imune a falha Cloudant: score={data['risk_score']} label={data['risk_label']}")


if __name__ == "__main__":
    print("=== TESTES CLOUDANT ===\n")
    t1 = TestCloudantDisabled()
    t1.setup_method()
    t1.test_returns_silently_when_disabled()
    t1.setup_method()
    t1.test_returns_silently_when_url_missing()

    t2 = TestCloudantSuccess()
    t2.setup_method()
    t2.test_put_document_called_with_correct_fields()

    t3 = TestCloudantFailure()
    t3.setup_method()
    t3.test_store_is_silent_on_connection_error()

    t4 = TestEndpointUnaffectedByCloudantFailure()
    t4.test_analyze_returns_200_when_cloudant_fails()

    print("\n=== TODOS OS TESTES CLOUDANT PASSARAM ===")
