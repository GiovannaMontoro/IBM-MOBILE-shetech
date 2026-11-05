/**
 * Cliente de API — SheTech Mobile
 * Todas as chamadas ao backend Python (FastAPI).
 *
 * URL configurável:
 *   Emulador Android padrão:  http://10.0.2.2:8000
 *   Dispositivo físico:        http://<IP-DA-MAQUINA>:8000
 *
 * Para celular físico, troque API_BASE pelo IP da sua máquina.
 * O IP é exibido ao iniciar o backend com start.ps1.
 */

// ─── Configuração da URL base ─────────────────────────────────────────────────
// Emulador Android padrão usa 10.0.2.2 para acessar o localhost da máquina.
// Para celular físico, troque pelo IP da sua rede (ex: http://192.168.1.10:8000).
export const API_BASE = 'http://10.0.2.2:8000';

// ─── Token de autenticação (injetado pelo authService após login) ─────────────
let _authToken = null;

export function setAuthToken(token) {
  _authToken = token;
}

export function getAuthToken() {
  return _authToken;
}

export function clearAuthToken() {
  _authToken = null;
}

// ─── Utilitários genéricos ────────────────────────────────────────────────────

function buildHeaders(extra = {}) {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }
  return headers;
}

async function handleResponse(response) {
  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data?.detail?.error ?? data?.detail ?? data?.message ?? message;
    } catch {
      // ignora falha de parse
    }
    throw new Error(message);
  }
  return response.json();
}

async function post(path, body, authenticated = false) {
  const headers = authenticated ? buildHeaders() : { 'Content-Type': 'application/json' };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return handleResponse(response);
  } finally {
    clearTimeout(timer);
  }

}

async function get(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      headers: buildHeaders(),
      signal: controller.signal,
    });
    return handleResponse(response);
  } finally {
    clearTimeout(timer);
  }

}

async function put(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

async function del(path) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse(response);
}

// ─── Autenticação ─────────────────────────────────────────────────────────────

/**
 * Cadastro de novo usuário.
 * @param {{ nome, email, senha, confirma_senha, cpf?, telefone? }} req
 * @returns {{ token, user }}
 */
export async function register(req) {
  return post('/api/auth/register', req);
}

/**
 * Login — retorna JWT.
 * @param {{ email, senha }} req
 * @returns {{ token, user }}
 */
export async function login(req) {
  return post('/api/auth/login', req);
}

/**
 * Perfil do usuário autenticado.
 * Requer token definido com setAuthToken().
 * @returns {UserOut}
 */
export async function getMe() {
  return get('/api/auth/me');
}

/**
 * Atualiza perfil / senha.
 * @param {{ nome?, cpf?, telefone?, tema?, notificacoes?, senha_atual?, nova_senha?, confirma_nova_senha? }} req
 * @returns {UserOut}
 */
export async function updateMe(req) {
  return put('/api/auth/me', req);
}

// ─── Guardião ─────────────────────────────────────────────────────────────────

/**
 * Analisa uma mensagem de texto suspeita.
 * @param {{ message, user_id?, language_profile?, monitoring_consent? }} req
 */
export async function analyzeMessage(req) {
  return post('/api/guardiao/analyze', req);
}

/**
 * Envia um arquivo (imagem ou áudio) para análise multimodal.
 * Usa multipart/form-data.
 */
export async function analyzeFile({ file, userId, languageProfile, monitoringConsent, contextText }) {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.mimeType ?? 'application/octet-stream',
  });
  form.append('user_id', userId ?? '');
  form.append('language_profile', languageProfile ?? 'standard');
  form.append('monitoring_consent', String(monitoringConsent ?? true));
  form.append('context_text', contextText ?? '');

  const headers = {};
  if (_authToken) {
    headers['Authorization'] = `Bearer ${_authToken}`;
  }

  const response = await fetch(`${API_BASE}/api/guardiao/analyze-file`, {
    method: 'POST',
    headers,
    body: form,
  });
  return handleResponse(response);
}

// ─── BB Decision ─────────────────────────────────────────────────────────────

/**
 * Simula uma decisão financeira.
 * @param {{ question, user_id?, language_profile?, simulation_consent? }} req
 */
export async function simulate(req) {
  return post('/api/bbdecision/simulate', req);
}

// ─── Chatbot ─────────────────────────────────────────────────────────────────

/**
 * Envia uma mensagem ao chatbot.
 * @param {{ message, history? }} req
 */
export async function chat(req) {
  return post('/api/chat', req);
}

// ─── Histórico ────────────────────────────────────────────────────────────────

/**
 * Salva uma entrada no histórico do servidor.
 * Requer token. Falhas silenciosas — não impede o fluxo principal.
 * @param {{ id, tipo, titulo?, riskLabel?, riskScore?, date? }} entry
 */
export async function saveHistoryEntry(entry) {
  try {
    const response = await fetch(`${API_BASE}/api/history`, {
      method: 'POST',
      headers: buildHeaders(),
      body: JSON.stringify(entry),
    });
    return handleResponse(response);
  } catch {
    // Falha silenciosa — histórico local no AsyncStorage continua funcionando
    return null;
  }
}

/**
 * Lista o histórico do usuário autenticado no servidor.
 * @returns {Array}
 */
export async function fetchHistory() {
  try {
    return await get('/api/history');
  } catch {
    return [];
  }
}

/**
 * Limpa o histórico do usuário no servidor.
 */
export async function clearServerHistory() {
  try {
    return await del('/api/history');
  } catch {
    return null;
  }
}

// ─── Health ───────────────────────────────────────────────────────────────────

/**
 * Verifica se o backend está online.
 * @returns {boolean}
 */
export async function checkHealth() {
  try {
    const response = await fetch(`${API_BASE}/health`, { method: 'GET' });
    return response.ok;
  } catch {
    return false;
  }
}
