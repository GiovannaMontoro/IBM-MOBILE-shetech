"""Testes de integracao do backend SheTech Mobile."""
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "ok"
    print("[OK] GET /health ->", data)

def test_register_login_me():
    # Cadastro
    r = client.post("/api/auth/register", json={
        "nome": "Teste Usuario",
        "email": "integracao@shetech.com",
        "senha": "Senha123!",
        "confirma_senha": "Senha123!",
    })
    assert r.status_code == 201, r.text
    token = r.json()["token"]
    user_id = r.json()["user"]["id"]
    print(f"[OK] POST /api/auth/register -> user_id={user_id}")

    # Login
    r = client.post("/api/auth/login", json={
        "email": "integracao@shetech.com",
        "senha": "Senha123!",
    })
    assert r.status_code == 200, r.text
    token = r.json()["token"]
    print(f"[OK] POST /api/auth/login -> token obtido")

    # Me
    r = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    assert r.json()["email"] == "integracao@shetech.com"
    print(f"[OK] GET /api/auth/me -> {r.json()['email']}")

    return token

def test_guardiao():
    r = client.post("/api/guardiao/analyze", json={
        "message": "Oi mae troquei o numero faz um pix de 500 agora urgente",
        "language_profile": "standard",
    })
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["risk_score"] > 0
    print(f"[OK] POST /api/guardiao/analyze -> score={data['risk_score']} label={data['risk_label']}")

def test_bbdecision():
    r = client.post("/api/bbdecision/simulate", json={
        "question": "E se eu parcelar uma compra de R$ 1200 em 12 vezes?",
    })
    assert r.status_code in (200, 202), r.text
    data = r.json()
    print(f"[OK] POST /api/bbdecision/simulate -> scenario={data.get('scenario_type')} clarification={data.get('clarification_needed')}")

def test_chat():
    r = client.post("/api/chat", json={"message": "como identificar um golpe"})
    assert r.status_code == 200, r.text
    resp = r.json()["response"]
    assert len(resp) > 20
    print(f"[OK] POST /api/chat -> {resp[:70]}...")

def test_history(token):
    # Salvar
    r = client.post("/api/history", json={
        "id": "entry-test-001",
        "tipo": "mensagem",
        "titulo": "Golpe de numero novo",
        "riskLabel": "alto",
        "riskScore": 65.0,
        "date": "05/11/2026 13:45",
    }, headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 201, r.text
    print("[OK] POST /api/history -> entrada salva")

    # Listar
    r = client.get("/api/history", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200, r.text
    entries = r.json()
    assert len(entries) >= 1
    print(f"[OK] GET /api/history -> {len(entries)} entrada(s)")

def test_register_duplicate():
    # Cadastra usuario
    client.post("/api/auth/register", json={
        "nome": "Duplicado",
        "email": "duplicado@shetech.com",
        "senha": "Senha123!",
        "confirma_senha": "Senha123!",
    })
    # Tenta cadastrar de novo
    r = client.post("/api/auth/register", json={
        "nome": "Duplicado 2",
        "email": "duplicado@shetech.com",
        "senha": "Senha123!",
        "confirma_senha": "Senha123!",
    })
    assert r.status_code == 409, f"Esperado 409, recebeu {r.status_code}"
    print("[OK] Register duplicado -> 409 EMAIL_ALREADY_EXISTS")

def test_unauthorized():
    r = client.get("/api/auth/me")
    assert r.status_code == 401, f"Esperado 401, recebeu {r.status_code}"
    print("[OK] GET /api/auth/me sem token -> 401")

if __name__ == "__main__":
    print("=== TESTES DE INTEGRACAO ===\n")
    test_health()
    token = test_register_login_me()
    test_guardiao()
    test_bbdecision()
    test_chat()
    test_history(token)
    test_register_duplicate()
    test_unauthorized()
    print("\n=== TODOS OS TESTES PASSARAM ===")
