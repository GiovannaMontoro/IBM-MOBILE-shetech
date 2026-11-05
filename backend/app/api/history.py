"""
Endpoint de histórico — SheTech Mobile Backend.

Permite ao app mobile sincronizar o histórico local com o banco de dados.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.crud import save_history_entry, get_history, clear_history
from app.api.auth import get_current_user
from app.db.database import User

router = APIRouter()


class HistoryEntryIn(BaseModel):
    id: str                        # entry_id gerado pelo app
    tipo: str
    titulo: Optional[str] = None
    riskLabel: Optional[str] = None
    riskScore: Optional[float] = None
    date: Optional[str] = None


class HistoryEntryOut(BaseModel):
    id: str
    tipo: str
    titulo: Optional[str] = None
    riskLabel: Optional[str] = None
    riskScore: Optional[float] = None
    date: Optional[str] = None


@router.post("", status_code=201, summary="Salvar entrada no histórico")
def save_entry(
    entry: HistoryEntryIn,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    save_history_entry(
        db,
        user_id=current_user.id,
        entry_id=entry.id,
        tipo=entry.tipo,
        titulo=entry.titulo or "",
        risk_label=entry.riskLabel,
        risk_score=entry.riskScore,
        data=entry.date,
    )
    return {"ok": True}


@router.get("", response_model=list[HistoryEntryOut], summary="Listar histórico do usuário")
def list_history(
    limit: int = Query(default=50, ge=1, le=200),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[HistoryEntryOut]:
    entries = get_history(db, user_id=current_user.id, limit=limit)
    return [
        HistoryEntryOut(
            id=e.entry_id,
            tipo=e.tipo,
            titulo=e.titulo,
            riskLabel=e.risk_label,
            riskScore=e.risk_score,
            date=e.data,
        )
        for e in entries
    ]


@router.delete("", summary="Limpar histórico do usuário")
def delete_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    count = clear_history(db, user_id=current_user.id)
    return {"deleted": count}
