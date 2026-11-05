/**
 * Cliente de API — SheTech Mobile
 * Todas as chamadas ao backend Python (FastAPI).
 *
 * URL configurável: defina API_BASE_URL em uma variável de ambiente
 * ou ajuste diretamente o fallback abaixo.
 *
 * Emulador Android padrão:  http://10.0.2.2:8000
 * Dispositivo físico:        http://<IP-DA-MAQUINA>:8000
 */

// Troque para o IP da sua máquina ao usar dispositivo físico
export const API_BASE = 'http://10.0.2.2:8000';

// ─── Utilitário genérico ──────────────────────────────────────────────────────

async function post(path, body) {
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data?.detail?.error ?? data?.detail ?? message;
    } catch {
      // ignora falha de parse
    }
    throw new Error(message);
  }

  return response.json();
}

// ─── Guardião ─────────────────────────────────────────────────────────────────

/**
 * Analisa uma mensagem de texto suspeita.
 * @param {Object} req
 * @param {string} req.message
 * @param {string} [req.user_id]
 * @param {string} [req.language_profile] 'standard' | 'low'
 * @param {boolean} [req.monitoring_consent]
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

  const response = await fetch(`${API_BASE}/api/guardiao/analyze-file`, {
    method: 'POST',
    body: form,
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const data = await response.json();
      message = data?.detail?.error ?? data?.detail ?? message;
    } catch {
      // ignora
    }
    throw new Error(message);
  }

  return response.json();
}

// ─── BB Decision ─────────────────────────────────────────────────────────────

/**
 * Simula uma decisão financeira.
 * @param {Object} req
 * @param {string} req.question
 * @param {string} [req.user_id]
 * @param {string} [req.language_profile]
 * @param {boolean} [req.simulation_consent]
 */
export async function simulate(req) {
  return post('/api/bbdecision/simulate', req);
}

// ─── Chatbot ─────────────────────────────────────────────────────────────────

/**
 * Envia uma mensagem ao chatbot.
 * @param {Object} req
 * @param {string} req.message
 * @param {Array} [req.history]
 */
export async function chat(req) {
  return post('/api/chat', req);
}
