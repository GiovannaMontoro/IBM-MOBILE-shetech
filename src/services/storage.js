/**
 * Armazenamento local persistente com AsyncStorage.
 * Usado para: histórico de testes, preferências, perfil.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PROFILE: 'shetech_profile',
  HISTORY: 'shetech_history',
  PREFERENCES: 'shetech_prefs',
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
    const json = await AsyncStorage.getItem(KEYS.PREFERENCES);
    return json ? JSON.parse(json) : { theme: 'light' };
  } catch {
    return { theme: 'light' };
  }
}

export async function savePreferences(prefs) {
  try {
    await AsyncStorage.setItem(KEYS.PREFERENCES, JSON.stringify(prefs));
    return true;
  } catch {
    return false;
  }
}
