"""
Configurações do backend mobile SheTech.
Nenhuma credencial deve ser escrita aqui — use o arquivo .env.

O .env deve estar em backend/.env (raiz do backend).
"""

from __future__ import annotations
import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict

_here = Path(__file__).resolve().parent.parent  # backend/

_env_files: list[str] = []
for candidate in (_here / ".env",):
    if candidate.is_file():
        _env_files.append(str(candidate))

_env_paths: tuple[str, ...] = tuple(_env_files) if _env_files else (".env",)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_env_paths,
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── LLM ───────────────────────────────────────────────────────────────────
    # "mock" → sem credenciais, análise determinística (padrão)
    # "watsonx" → IBM watsonx.ai (requer WATSONX_API_KEY + WATSONX_PROJECT_ID)
    # "openai"  → OpenAI (requer OPENAI_API_KEY)
    llm_provider: str = "mock"

    # IBM watsonx.ai
    watsonx_api_key: str = ""
    watsonx_project_id: str = ""
    watsonx_url: str = "https://us-south.ml.cloud.ibm.com"
    watsonx_model_id: str = "ibm/granite-13b-chat-v2"
    watsonx_vision_model_id: str = "meta-llama/llama-3-2-90b-vision-instruct"

    # Watson Speech to Text
    watson_stt_api_key: str = ""
    watson_stt_url: str = ""

    # OpenAI
    openai_api_key: str = ""
    openai_model_id: str = "gpt-4o"
    openai_vision_model_id: str = "gpt-4o"

    # ── Aplicação ─────────────────────────────────────────────────────────────
    app_env: str = "development"
    log_level: str = "INFO"

    # ── Banco de dados ────────────────────────────────────────────────────────
    # SQLite local — arquivo criado em backend/shetech.db
    database_url: str = "sqlite:///./shetech.db"

    # ── IBM Cloudant — eventos de análise ─────────────────────────────────────
    # Banco: shetech_analises (instância watsonx-Hackathon Cloudant)
    # cloudant_enabled=False → integração desativada (padrão seguro)
    cloudant_enabled: bool = False
    cloudant_url: str = ""
    cloudant_apikey: str = ""
    cloudant_db: str = "shetech_analises"
    # Banco de simulações do BB Decision
    cloudant_db_bbdecision: str = "shetech_bbdecision"

    # ── Segurança ─────────────────────────────────────────────────────────────
    max_input_length: int = 2000
    prompt_injection_guard: bool = True

    # JWT para autenticação mobile
    jwt_secret: str = "shetech-mobile-dev-secret-mude-em-producao"
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24 * 7  # 7 dias

    # ── CORS — celular físico ─────────────────────────────────────────────────
    # Em desenvolvimento: aceita qualquer origem.
    # Em produção: liste os IPs/domínios explicitamente.
    cors_allow_all_origins: bool = True
    cors_allowed_origins: str = ""  # ex: "http://192.168.1.10:8081,https://meuapp.com"


settings = Settings()
