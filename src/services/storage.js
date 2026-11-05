/**
 * Armazenamento local persistente com AsyncStorage.
 * Usado para: histórico de testes, preferências, perfil, token JWT.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE:  'shetech_profile',
  HISTORY:  'shetech_history',
  PREFS:    'shetech_prefs',
  TOKEN:    'shetech_token',
};

// ─── Perfil ───────────────────────────────────────────────────────────────────

export async function getProfile() {
  try {
    const json = await AsyncStorage.getItem(KEYS.PROFILE);
    return json ? JSON.parse(json) : {
      nome: 'Usuário',
      email: 'usuario@email.com',
      telefone: '',
      twoFA: false,
      theme: 'light',
      diasAtivo: 0,
      analises: 0,
      bloqueios: 0,
      simulacoes: 0,
    };
  } catch {
    return null;
  }
}

export async function saveProfile(data) {
  try {
    await AsyncStorage.setItem(KEYS.PROFILE, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

// ─── Histórico ────────────────────────────────────────────────────────────────

export async function getHistory() {
  try {
    const json = await AsyncStorage.getItem(KEYS.HISTORY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

export async function addHistoryEntry(entry) {
  try {
    const current = await getHistory();
    const updated = [entry, ...current].slice(0, 50); // máx 50 entradas
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function clearHistory() {
  try {
    await AsyncStorage.removeItem(KEYS.HISTORY);
    return true;
  } catch {
    return false;
  }
}

// ─── Preferências ─────────────────────────────────────────────────────────────

export async function getPreferences() {
  try {
    const json = await AsyncStorage.getItem(KEYS.PREFS);
    return json ? JSON.parse(json) : { theme: 'light' };
  } catch {
    return { theme: 'light' };
  }
}

export async function savePreferences(prefs) {
  try {
    await AsyncStorage.setItem(KEYS.PREFS, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}

// ─── Token JWT ────────────────────────────────────────────────────────────────

/**
 * Persiste o token JWT no AsyncStorage para restaurar sessão ao reabrir o app.
 */
export async function saveToken(token) {
  try {
    await AsyncStorage.setItem(KEYS.TOKEN, token);
    return true;
  } catch {
    return false;
  }
}

/**
 * Recupera o token JWT salvo. Retorna null se não houver.
 */
export async function getSavedToken() {
  try {
    return await AsyncStorage.getItem(KEYS.TOKEN);
  } catch {
    return null;
  }
}

/**
 * Remove o token (logout).
 */
export async function removeToken() {
  try {
    await AsyncStorage.removeItem(KEYS.TOKEN);
    return true;
  } catch {
    return false;
  }
}
