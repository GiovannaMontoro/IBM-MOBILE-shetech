# SheTech Mobile — Backend

Backend FastAPI do aplicativo mobile SheTech.

---

## Pré-requisitos

- Python 3.11 ou superior
- pip

---

## Instalação e inicialização (Windows PowerShell)

```powershell
# 1. Entre na pasta do backend
cd backend

# 2. Inicie com o script (instala dependências automaticamente)
.\start.ps1
```

O script vai:
- Criar o ambiente virtual `venv/` automaticamente
- Instalar todas as dependências
- Criar o arquivo `.env` a partir do `.env.example`
- Exibir o IP da sua máquina (necessário para celular físico)
- Iniciar o servidor na porta 8000

---

## Instalação manual (alternativa)

```powershell
cd backend

# Cria e ativa o ambiente virtual
python -m venv venv
.\venv\Scripts\Activate.ps1

# Instala dependências (torch é grande — pode demorar)
pip install -r requirements.txt

# Inicia o servidor
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## Endpoints disponíveis

| Endpoint | Método | Descrição |
|---|---|---|
| `/health` | GET | Status do servidor |
| `/api/auth/register` | POST | Cadastro |
| `/api/auth/login` | POST | Login → retorna JWT |
| `/api/auth/me` | GET | Perfil do usuário autenticado |
| `/api/auth/me` | PUT | Atualizar perfil / senha |
| `/api/guardiao/analyze` | POST | Análise de texto |
| `/api/guardiao/analyze-file` | POST | Análise de imagem ou áudio |
| `/api/bbdecision/simulate` | POST | Simulação financeira |
| `/api/chat` | POST | Chatbot de segurança |
| `/api/history` | GET/POST/DELETE | Histórico do usuário |

Documentação interativa: **http://localhost:8000/docs**

---

## Configuração para celular físico

No emulador Android, o app usa `http://10.0.2.2:8000` automaticamente.

Para usar com um **celular físico** na mesma rede Wi-Fi:

1. Descubra o IP da sua máquina (exibido pelo `start.ps1` ou via `ipconfig`)
2. Edite [`src/services/api.js`](../src/services/api.js):

```js
// Antes (emulador):
export const API_BASE = 'http://10.0.2.2:8000';

// Depois (celular físico — use seu IP):
export const API_BASE = 'http://192.168.1.10:8000';  // exemplo
```

3. Garanta que o firewall do Windows permite conexões na porta 8000:

```powershell
New-NetFirewallRule -DisplayName "SheTech Backend" -Direction Inbound -Protocol TCP -LocalPort 8000 -Action Allow
```

---

## Configuração de IA real (opcional)

Por padrão o backend usa análise determinística (sem API externa).

Para ativar IA real, edite `backend/.env`:

### IBM watsonx.ai

```env
LLM_PROVIDER=watsonx
WATSONX_API_KEY=sua-chave-aqui
WATSONX_PROJECT_ID=seu-project-id-aqui
```

### OpenAI

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-sua-chave-aqui
```

---

## Análise de imagem e áudio (processamento local)

Na **primeira execução** com imagem ou áudio, o backend baixa automaticamente:
- **EasyOCR** (~40 MB) — OCR para análise de imagens
- **Whisper tiny** (~74 MB) — transcrição de áudio

Requer internet apenas na 1ª vez. Funciona offline depois.

---

## Banco de dados

SQLite local em `backend/shetech.db` — criado automaticamente ao iniciar.

Tabelas:
- `users` — cadastro e perfil dos usuários
- `history` — histórico de análises e testes

---

## Testes

```powershell
cd backend
python test_integration.py
```

Resultado esperado: `=== TODOS OS TESTES PASSARAM ===`
