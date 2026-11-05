"""
API de autenticação — SheTech Mobile Backend.

Endpoints:
  POST /api/auth/register  → Cadastro de novo usuário
  POST /api/auth/login     → Login → retorna JWT
  GET  /api/auth/me        → Perfil do usuário autenticado
  PUT  /api/auth/me        → Atualizar perfil / senha
"""

from __future__ import annotations

import re
from typing import Optional

from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, field_validator, EmailStr
from sqlalchemy.orm import Session

from app.db.database import get_db, User
from app.db.crud import (
    get_user_by_email, create_user, authenticate_user,
    get_user_by_id, update_user, update_password,
)
from app.db.security import create_access_token, decode_access_token

router = APIRouter()
_bearer = HTTPBearer(auto_error=False)


# ─── Schemas ──────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    nome: str = Field(..., min_length=2, max_length=120, description="Nome completo")
    email: EmailStr
    senha: str = Field(..., min_length=6, max_length=100, description="Senha (mínimo 6 caracteres)")
    confirma_senha: str = Field(..., description="Confirmar senha")
    cpf: str = Field(default="", max_length=14)
    telefone: str = Field(default="", max_length=20)

    @field_validator("nome")
    @classmethod
    def nome_valido(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("O nome não pode estar vazio.")
        return v.strip()

    @field_validator("confirma_senha")
    @classmethod
    def senhas_coincidem(cls, v: str, info) -> str:
        senha = info.data.get("senha", "")
        if v != senha:
            raise ValueError("As senhas não coincidem.")
        return v

    @field_validator("cpf")
    @classmethod
    def cpf_formato(cls, v: str) -> str:
        if not v:
            return v
        # Aceita apenas dígitos e pontuação padrão
        clean = re.sub(r"[^\d]", "", v)
        if clean and len(clean) != 11:
            raise ValueError("CPF deve ter 11 dígitos.")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str = Field(..., min_length=1)


class UserOut(BaseModel):
    id: int
    nome: str
    email: str
    cpf: Optional[str] = None
    telefone: Optional[str] = None
    tema: str
    notificacoes: bool

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    token: str
    user: UserOut


class UpdateProfileRequest(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=2, max_length=120)
    cpf: Optional[str] = Field(default=None, max_length=14)
    telefone: Optional[str] = Field(default=None, max_length=20)
    tema: Optional[str] = Field(default=None, pattern=r"^(claro|escuro)$")
    notificacoes: Optional[bool] = None
    senha_atual: Optional[str] = None
    nova_senha: Optional[str] = Field(default=None, min_length=6, max_length=100)
    confirma_nova_senha: Optional[str] = None


class ErrorResponse(BaseModel):
    error: str
    code: str


# ─── Dependency: usuário autenticado ─────────────────────────────────────────

def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Token de autenticação não fornecido.", "code": "NOT_AUTHENTICATED"},
        )
    payload = decode_access_token(credentials.credentials)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Token inválido ou expirado.", "code": "INVALID_TOKEN"},
        )
    user_id = int(payload.get("sub", 0))
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "Usuário não encontrado.", "code": "USER_NOT_FOUND"},
        )
    return user


# ─── Endpoints ────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Cadastro de novo usuário",
)
def register(request: RegisterRequest, db: Session = Depends(get_db)) -> AuthResponse:
    if get_user_by_email(db, request.email):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": "Este e-mail já está cadastrado.", "code": "EMAIL_ALREADY_EXISTS"},
        )
    user = create_user(
        db,
        nome=request.nome,
        email=request.email,
        senha=request.senha,
        cpf=request.cpf,
        telefone=request.telefone,
    )
    token = create_access_token(user.id, user.email)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@router.post(
    "/login",
    response_model=AuthResponse,
    summary="Login — retorna JWT",
)
def login(request: LoginRequest, db: Session = Depends(get_db)) -> AuthResponse:
    user = authenticate_user(db, request.email, request.senha)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": "E-mail ou senha incorretos.", "code": "INVALID_CREDENTIALS"},
        )
    token = create_access_token(user.id, user.email)
    return AuthResponse(token=token, user=UserOut.model_validate(user))


@router.get(
    "/me",
    response_model=UserOut,
    summary="Perfil do usuário autenticado",
)
def get_me(current_user: User = Depends(get_current_user)) -> UserOut:
    return UserOut.model_validate(current_user)


@router.put(
    "/me",
    response_model=UserOut,
    summary="Atualizar perfil / senha",
)
def update_me(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    # Campos de perfil a atualizar
    updates: dict = {}
    if request.nome is not None:
        updates["nome"] = request.nome.strip()
    if request.cpf is not None:
        updates["cpf"] = request.cpf.strip()
    if request.telefone is not None:
        updates["telefone"] = request.telefone.strip()
    if request.tema is not None:
        updates["tema"] = request.tema
    if request.notificacoes is not None:
        updates["notificacoes"] = request.notificacoes

    if updates:
        update_user(db, current_user, **updates)

    # Troca de senha (opcional)
    if request.nova_senha:
        if not request.senha_atual:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "A senha atual é necessária para trocar a senha.", "code": "SENHA_ATUAL_REQUIRED"},
            )
        from app.db.security import verify_password
        if not verify_password(request.senha_atual, current_user.senha_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "Senha atual incorreta.", "code": "WRONG_CURRENT_PASSWORD"},
            )
        if request.nova_senha != request.confirma_nova_senha:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"error": "A nova senha e a confirmação não coincidem.", "code": "PASSWORD_MISMATCH"},
            )
        update_password(db, current_user, request.nova_senha)

    db.refresh(current_user)
    return UserOut.model_validate(current_user)


@router.get("/health", summary="Verifica disponibilidade da auth", tags=["Infraestrutura"])
def auth_health() -> dict:
    return {"status": "ok", "service": "auth"}
