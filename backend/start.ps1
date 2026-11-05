# SheTech Mobile Backend — Script de inicialização (Windows PowerShell)
# Execute: .\start.ps1

$ErrorActionPreference = "Stop"

Write-Host "=== SheTech Mobile Backend ===" -ForegroundColor Cyan
Write-Host ""

# Verifica se Python está disponível
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Python não encontrado. Instale Python 3.11+ e tente novamente." -ForegroundColor Red
    exit 1
}

$pyVersion = python --version 2>&1
Write-Host "Python: $pyVersion" -ForegroundColor Green

# Verifica se o .env existe; se não, cria a partir do exemplo
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "Arquivo .env criado a partir do .env.example." -ForegroundColor Yellow
        Write-Host "Edite .env para configurar chaves de API, se necessário." -ForegroundColor Yellow
    } else {
        Write-Host "AVISO: .env não encontrado. Usando valores padrão." -ForegroundColor Yellow
    }
}

# Verifica se o ambiente virtual existe; cria se necessário
if (-not (Test-Path "venv")) {
    Write-Host "Criando ambiente virtual Python..." -ForegroundColor Yellow
    python -m venv venv
    Write-Host "Ambiente virtual criado em backend\venv\" -ForegroundColor Green
}

# Ativa o ambiente virtual
$activate = ".\venv\Scripts\Activate.ps1"
if (Test-Path $activate) {
    Write-Host "Ativando ambiente virtual..." -ForegroundColor Yellow
    & $activate
} else {
    Write-Host "AVISO: Não foi possível ativar o venv. Usando Python global." -ForegroundColor Yellow
}

# Instala dependências
Write-Host "Instalando dependências..." -ForegroundColor Yellow
Write-Host "(Isso pode demorar alguns minutos na primeira vez — torch é grande)" -ForegroundColor Gray
pip install -r requirements.txt --quiet

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERRO: Falha ao instalar dependências." -ForegroundColor Red
    exit 1
}

Write-Host "Dependências instaladas." -ForegroundColor Green
Write-Host ""

# Mostra o IP da máquina para configuração no celular físico
Write-Host "=== Configuração para celular físico ===" -ForegroundColor Cyan
$ips = Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notmatch "^(127\.|169\.)" }
foreach ($ip in $ips) {
    Write-Host "  IP disponível: $($ip.IPAddress)" -ForegroundColor White
}
Write-Host "  No arquivo src/services/api.js do app, troque:" -ForegroundColor Gray
Write-Host "    http://10.0.2.2:8000  →  http://<SEU-IP>:8000" -ForegroundColor Gray
Write-Host ""

# Inicia o servidor
Write-Host "=== Iniciando servidor na porta 8000 ===" -ForegroundColor Cyan
Write-Host "Documentação da API: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "Pressione Ctrl+C para parar." -ForegroundColor Gray
Write-Host ""

python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
