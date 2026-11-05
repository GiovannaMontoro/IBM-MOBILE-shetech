# -*- coding: utf-8 -*-
"""
API do Chatbot -- SheTech Mobile Backend.

Endpoint:
  POST /api/chat  -> Responde mensagens sobre seguranca digital

O chatbot opera em dois modos:
  1. Backend real com LLM (quando configurado): encaminha ao provedor LLM.
  2. Fallback determinisico: responde com base em categorias de seguranca
     -- funciona sem nenhuma chave de API.
"""

from __future__ import annotations

from typing import Optional
from fastapi import APIRouter
from pydantic import BaseModel, Field

router = APIRouter()


# -- Schemas ------------------------------------------------------------------

class ChatMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=1000)
    history: list[ChatMessage] = Field(default_factory=list)


class ChatResponse(BaseModel):
    response: str


# -- Base de conhecimento deterministica --------------------------------------

_CATEGORIAS = [
    {
        "chaves": ["oi", "ola", "bom dia", "boa tarde", "boa noite", "ei", "hey",
                   "tudo bem", "tudo bom", "opa"],
        "resposta": (
            "Ola! Sou o assistente de seguranca digital do SheTech. "
            "Posso ajudar com duvidas sobre golpes, phishing, senhas seguras, Pix, "
            "fraudes digitais e organizacao financeira. Como posso ajudar voce?"
        ),
    },
    {
        "chaves": ["phishing", "email falso", "mensagem falsa", "link falso",
                   "email suspeito"],
        "resposta": (
            "Phishing e uma tentativa de roubo de dados por e-mail, SMS ou mensagem falsa.\n\n"
            "Sinais de alerta:\n"
            "- Remetente desconhecido ou com endereco suspeito\n"
            "- Urgencia excessiva ('Sua conta sera bloqueada!')\n"
            "- Link que nao corresponde ao site oficial\n"
            "- Pedido de senha, codigo ou dados bancarios\n\n"
            "O que fazer: Nunca clique sem verificar. Acesse o site oficial digitando "
            "o endereco diretamente no navegador. Use o Guardiao para analisar mensagens suspeitas."
        ),
    },
    {
        "chaves": ["link", "url", "site falso", "site suspeito", "endereco suspeito"],
        "resposta": (
            "Para identificar links falsos:\n\n"
            "- Verifique se comeca com https:// e tem cadeado\n"
            "- Confira se o dominio e o oficial (ex: bb.com.br, nao bb-login.com)\n"
            "- Desconfie de encurtadores de URL em mensagens\n"
            "- Prefira digitar o endereco diretamente no navegador\n\n"
            "Use o Guardiao para analisar qualquer texto ou link suspeito que voce receber."
        ),
    },
    {
        "chaves": ["senha", "password", "conta hackeada", "autenticacao",
                   "dois fatores", "2fa"],
        "resposta": (
            "Dicas para senhas seguras:\n\n"
            "- Use ao menos 12 caracteres\n"
            "- Misture letras maiusculas, minusculas, numeros e simbolos\n"
            "- Nao reutilize a mesma senha em sites diferentes\n"
            "- Use um gerenciador de senhas confiavel\n"
            "- Ative a autenticacao em dois fatores (2FA) sempre que possivel\n"
            "- Troque a senha imediatamente se suspeitar de vazamento"
        ),
    },
    {
        "chaves": ["pix", "transferencia", "ted", "doc", "boleto falso", "boleto"],
        "resposta": (
            "Golpes com Pix sao os mais comuns no Brasil. Como se proteger:\n\n"
            "- Nunca faca Pix a pedido de mensagens, mesmo que parecam do banco\n"
            "- Confirme sempre o nome do destinatario antes de confirmar\n"
            "- Desconfie de pedidos urgentes de filhos/familiares (golpe do familiar)\n"
            "- Bancos nunca pedem senha ou codigo por ligacao\n"
            "- Verifique movimentacoes suspeitas no aplicativo oficial do banco"
        ),
    },
    {
        "chaves": ["golpe", "fraude", "scam", "estelionato", "cai em golpe",
                   "fui vitima", "enganada", "enganado", "roubaram"],
        "resposta": (
            "Se voce caiu em um golpe, aja rapido:\n\n"
            "1. Ligue imediatamente para seu banco (numero no cartao ou app oficial)\n"
            "2. Bloqueie cartoes e Pix pelo aplicativo\n"
            "3. Registre boletim de ocorrencia (delegaciaonline.pc.sp.gov.br)\n"
            "4. Guarde prints e comprovantes como evidencia\n"
            "5. Notifique o Banco Central: consumidor.gov.br\n\n"
            "Quanto mais rapido voce agir, maiores as chances de recuperar o valor."
        ),
    },
    {
        "chaves": ["engenharia social", "manipulacao", "pressao"],
        "resposta": (
            "Engenharia social e quando criminosos manipulam pessoas para obter informacoes.\n\n"
            "Taticas mais comuns:\n"
            "- Criar urgencia falsa ('Sua conta sera bloqueada em 2 horas!')\n"
            "- Se passar por funcionario do banco, governo ou familiar\n"
            "- Pedir sigilo ('nao conte para ninguem antes de fazer')\n\n"
            "Regra de ouro: Diante de qualquer pressao, pause, respire e verifique "
            "pelo canal oficial antes de agir."
        ),
    },
    {
        "chaves": ["financ", "dinheiro", "investimento", "poupanca", "reserva",
                   "orcamento", "organizar"],
        "resposta": (
            "Dicas de organizacao financeira:\n\n"
            "- Registre todos os seus gastos mensais\n"
            "- Separe pelo menos 10% da renda como reserva de emergencia\n"
            "- Evite parcelamentos com juros altos\n"
            "- Priorize quitar dividas antes de investir\n\n"
            "Use o BB Decision para simular decisoes financeiras antes de toma-las."
        ),
    },
    {
        "chaves": ["whatsapp", "telegram", "sms", "zap"],
        "resposta": (
            "Golpes por mensagem (WhatsApp, SMS, Telegram) sao muito comuns.\n\n"
            "Fique atento:\n"
            "- Nao clique em links recebidos por mensagem\n"
            "- Desconfie de promocoes, sorteios e premios inesperados\n"
            "- Ative a verificacao em duas etapas no WhatsApp (Configuracoes > Conta)\n"
            "- Golpe do WhatsApp clonado: criminosos usam seu numero para pedir dinheiro\n\n"
            "Use o Guardiao para analisar mensagens suspeitas."
        ),
    },
    {
        "chaves": ["aplicativo", "app falso", "play store", "google play"],
        "resposta": (
            "Cuidado com aplicativos falsos:\n\n"
            "- Baixe apps apenas de lojas oficiais (Google Play, App Store)\n"
            "- Verifique o desenvolvedor e os comentarios antes de instalar\n"
            "- Apps do banco nunca pedem senha por notificacao ou ligacao\n"
            "- Nao instale apps pedidos por ligacao ou mensagem\n"
            "- Mantenha o sistema e os apps sempre atualizados"
        ),
    },
    {
        "chaves": ["guardiao", "analis", "mensagem suspeita", "verificar mensagem"],
        "resposta": (
            "O Guardiao analisa mensagens, imagens e audios para identificar sinais de golpe.\n\n"
            "Como usar:\n"
            "1. Acesse o Guardiao pelo menu principal\n"
            "2. Cole a mensagem suspeita ou anexe uma imagem/audio\n"
            "3. Clique em Analisar\n"
            "4. O Guardiao mostra o nivel de risco, os sinais detectados e o que fazer"
        ),
    },
    {
        "chaves": ["bb decision", "bbdecision", "simulacao", "simular", "decisao financeira"],
        "resposta": (
            "O BB Decision simula decisoes financeiras antes de voce toma-las.\n\n"
            "Como usar:\n"
            "1. Acesse o BB Decision pelo menu principal\n"
            "2. Escreva sua duvida em linguagem natural\n"
            "3. O sistema identifica o cenario e faz os calculos\n"
            "4. Voce ve a situacao atual e a alternativa lado a lado\n\n"
            "Cenarios: parcelamento, perda de renda, mudanca de emprego, compra de imovel."
        ),
    },
    {
        "chaves": ["como usar", "ajuda", "help", "o que voce faz", "o que voce pode"],
        "resposta": (
            "Posso ajudar com:\n\n"
            "- Golpes e fraudes digitais\n"
            "- Phishing e links suspeitos\n"
            "- Senhas e seguranca de conta\n"
            "- Pix e transferencias seguras\n"
            "- Organizacao financeira\n"
            "- Como usar o Guardiao e o BB Decision\n\n"
            "E qualquer outra duvida sobre seguranca digital. Pode perguntar!"
        ),
    },
]

_FAQ_FALLBACK = [
    "Como identificar um golpe?",
    "O que e phishing?",
    "Como criar uma senha segura?",
    "O que fazer se cai em um golpe?",
    "Como usar o Guardiao?",
]


def _normalizar(texto: str) -> str:
    """Remove acentos e converte para minusculas."""
    import unicodedata
    return unicodedata.normalize("NFD", texto.lower()).encode("ascii", "ignore").decode()


def _resposta_local(mensagem: str) -> str:
    lower = _normalizar(mensagem)
    for cat in _CATEGORIAS:
        chaves_norm = [_normalizar(k) for k in cat["chaves"]]
        if any(k in lower for k in chaves_norm):
            return cat["resposta"]

    return (
        "Nao tenho certeza sobre isso, mas posso ajudar com os temas mais comuns:\n\n"
        + "\n".join(f"- {q}" for q in _FAQ_FALLBACK)
        + "\n\nDigite uma dessas perguntas ou reformule sua duvida."
    )


# -- Endpoint -----------------------------------------------------------------

@router.post(
    "",
    response_model=ChatResponse,
    summary="Chatbot SheTech -- seguranca digital e financas",
)
def chat_endpoint(request: ChatRequest) -> ChatResponse:
    """
    Tenta usar o LLM configurado para uma resposta natural.
    Cai no fallback deterministico se o LLM nao estiver disponivel.
    """
    try:
        from app.llm.provider import get_llm_provider
        from app.config import settings as s

        if s.llm_provider != "mock":
            provider = get_llm_provider()
            system_prompt = (
                "Voce e o assistente virtual do SheTech, solucao de seguranca digital "
                "do Banco do Brasil. Responda em portugues brasileiro. "
                "Foque em: prevencao de golpes, seguranca digital, educacao financeira. "
                "Seja claro, direto e empatico. Maximo 300 palavras por resposta."
            )
            history_text = ""
            for msg in request.history[-6:]:
                role = "Usuario" if msg.role == "user" else "Assistente"
                history_text += f"{role}: {msg.content}\n"

            user_message = history_text + f"Usuario: {request.message}"
            result = provider.complete(system_prompt, user_message)
            if not result.is_mock:
                return ChatResponse(response=result.text)
    except Exception:
        pass

    return ChatResponse(response=_resposta_local(request.message))


@router.get("/health", summary="Verifica disponibilidade do chatbot", tags=["Infraestrutura"])
def chat_health() -> dict:
    return {"status": "ok", "service": "chat"}
