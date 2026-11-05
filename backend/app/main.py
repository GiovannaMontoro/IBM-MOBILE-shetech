"""
SheTech Mobile Backend — FastAPI entry point.

Routers registrados:
  /api/guardiao    → análise de golpes (Guardião)
  /api/bbdecision  → simulações financeiras (BB Decision)
  /api/auth        → autenticação (login, cadastro, perfil)
  /api/chat        → chatbot de segurança digital
  /api/history     → histórico de análises e testes

CORS: aceita qualquer origem em desenvolvimento (cors_allow_all_origins=True no .env).
Em produção, defina cors_allow_all_origins=False e liste os IPs em cors_allowed_origins.
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import guardiao, bbdecision, auth, chat, history
from app.config import settings
from app.db.database import create_tables

# Cria tabelas do banco de dados na inicialização
create_tables()

app = FastAPI(
    title="SheTech Mobile Backend",
    description=(
        "Backend do aplicativo mobile SheTech.\n\n"
        "**Guardião**: detecção de golpes de engenharia social via análise de texto, imagem e áudio.\n\n"
        "**BB Decision**: simulador de decisões financeiras em linguagem natural.\n\n"
        "**Autenticação**: cadastro, login e perfil de usuário com JWT.\n\n"
        "**Chatbot**: assistente de segurança digital.\n\n"
        "Todos os dados sintéticos. Simulações são estimativas educacionais."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Celular físico e emulador precisam de CORS liberado em desenvolvimento.
# Em produção: cors_allow_all_origins=False + cors_allowed_origins="http://seu-ip:8081"

if settings.cors_allow_all_origins:
    _origins = ["*"]
else:
    _origins = [o.strip() for o in settings.cors_allowed_origins.split(",") if o.strip()]
    if not _origins:
        _origins = ["http://localhost:8081", "http://10.0.2.2:8081"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False if "*" in _origins else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(guardiao.router, prefix="/api/guardiao", tags=["Guardião"])
app.include_router(bbdecision.router, prefix="/api/bbdecision", tags=["BB Decision"])
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticação"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chatbot"])
app.include_router(history.router, prefix="/api/history", tags=["Histórico"])


# ── Health global ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["Infraestrutura"])
def health_check() -> dict:
    """Verifica se a API está no ar."""
    from app.config import settings as s
    return {
        "status": "ok",
        "version": "1.0.0",
        "llm_provider": s.llm_provider,
        "env": s.app_env,
    }
