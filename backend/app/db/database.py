"""
Banco de dados SQLite — SheTech Mobile Backend.

Tabelas:
  users    → cadastro e perfil dos usuários
  history  → histórico de análises e testes
"""

from __future__ import annotations

from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from app.config import settings

engine = create_engine(
    settings.database_url,
    connect_args={"check_same_thread": False},  # necessário para SQLite
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# ─── Modelos ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id           = Column(Integer, primary_key=True, index=True)
    nome         = Column(String(120), nullable=False)
    email        = Column(String(200), unique=True, index=True, nullable=False)
    senha_hash   = Column(String(256), nullable=False)
    cpf          = Column(String(14), nullable=True)
    telefone     = Column(String(20), nullable=True)
    tema         = Column(String(20), default="claro")       # claro | escuro
    notificacoes = Column(Boolean, default=True)
    criado_em    = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class HistoryEntry(Base):
    __tablename__ = "history"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, nullable=True)       # None = usuário não autenticado
    entry_id   = Column(String(40), unique=True, index=True)  # ID gerado pelo app
    tipo       = Column(String(40), nullable=False)   # mensagem | image | audio | teste | simulacao
    titulo     = Column(Text, nullable=True)
    risk_label = Column(String(20), nullable=True)    # baixo | médio | alto | crítico
    risk_score = Column(Float, nullable=True)
    data       = Column(String(40), nullable=True)    # string formatada pelo app
    criado_em  = Column(DateTime, default=datetime.utcnow)


def create_tables() -> None:
    """Cria todas as tabelas se não existirem."""
    Base.metadata.create_all(bind=engine)


def get_db():
    """Dependency para injetar sessão do banco nas rotas FastAPI."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
