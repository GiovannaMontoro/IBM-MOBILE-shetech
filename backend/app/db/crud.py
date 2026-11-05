"""
Operações CRUD — SheTech Mobile Backend.
"""

from __future__ import annotations

from datetime import datetime
from typing import Optional

from sqlalchemy.orm import Session

from app.db.database import User, HistoryEntry
from app.db.security import hash_password, verify_password


# ─── Usuários ─────────────────────────────────────────────────────────────────

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email.lower().strip()).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, nome: str, email: str, senha: str,
                cpf: str = "", telefone: str = "") -> User:
    user = User(
        nome=nome.strip(),
        email=email.lower().strip(),
        senha_hash=hash_password(senha),
        cpf=cpf.strip() if cpf else None,
        telefone=telefone.strip() if telefone else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def update_user(db: Session, user: User, **kwargs) -> User:
    for key, value in kwargs.items():
        if hasattr(user, key) and key not in ("id", "senha_hash", "criado_em"):
            setattr(user, key, value)
    user.atualizado_em = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def update_password(db: Session, user: User, nova_senha: str) -> User:
    user.senha_hash = hash_password(nova_senha)
    user.atualizado_em = datetime.utcnow()
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, senha: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(senha, user.senha_hash):
        return None
    return user


# ─── Histórico ────────────────────────────────────────────────────────────────

def save_history_entry(db: Session, user_id: Optional[int], entry_id: str,
                       tipo: str, titulo: str, risk_label: str = None,
                       risk_score: float = None, data: str = None) -> HistoryEntry:
    # Upsert: se entry_id já existe, atualiza
    existing = db.query(HistoryEntry).filter(HistoryEntry.entry_id == entry_id).first()
    if existing:
        return existing

    entry = HistoryEntry(
        user_id=user_id,
        entry_id=entry_id,
        tipo=tipo,
        titulo=titulo[:500] if titulo else None,
        risk_label=risk_label,
        risk_score=risk_score,
        data=data,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_history(db: Session, user_id: Optional[int], limit: int = 50) -> list[HistoryEntry]:
    q = db.query(HistoryEntry)
    if user_id is not None:
        q = q.filter(HistoryEntry.user_id == user_id)
    return q.order_by(HistoryEntry.criado_em.desc()).limit(limit).all()


def clear_history(db: Session, user_id: int) -> int:
    deleted = db.query(HistoryEntry).filter(HistoryEntry.user_id == user_id).delete()
    db.commit()
    return deleted
