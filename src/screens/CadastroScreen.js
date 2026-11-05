/**
 * CadastroScreen — Cadastro completo do usuário.
 * Referência: cadastro.html
 *
 * Campos:
 * - Nome completo
 * - E-mail
 * - CPF (com máscara)
 * - Telefone (com máscara)
 * - Senha
 * - Confirmar senha
 * Validações completas + mostrar/ocultar senha
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Platform, StatusBar, KeyboardAvoidingView, ScrollView, Alert,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { saveProfile, saveToken } from '../services/storage';
import { register as apiRegister, setAuthToken } from '../services/api';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { bg: '#FFFFFF', navy: '#1B3A6B', blue: '#1F5FD0', yellow: '#F5C518', gray: '#F4F6FB', grayBorder: '#E8ECF4', textMed: '#4A5568', placeholder: '#A0AEC0', error: '#E53E3E' };

// ─── Máscaras ────────────────────────────────────────────────────────────────

function maskCPF(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function maskPhone(v) {
  return v.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}

// ─── Validações ──────────────────────────────────────────────────────────────

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateCPF(cpf) {
  const digits = cpf.replace(/\D/g, '');
  return digits.length === 11;
}

function validatePassword(password) {
  if (password.length < 8) return 'Mínimo 8 caracteres.';
  if (!/[A-Z]/.test(password)) return 'Inclua ao menos uma letra maiúscula.';
  if (!/[0-9]/.test(password)) return 'Inclua ao menos um número.';
  return null;
}

// ─── Ícones ──────────────────────────────────────────────────────────────────
function EyeIcon({ visible }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      {visible ? (
        <>
          <Path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" stroke={C.placeholder} strokeWidth={2} />
          <Circle cx="12" cy="12" r="3" stroke={C.placeholder} strokeWidth={2} />
        </>
      ) : (
        <>
          <Path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
          <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19M1 1l22 22" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

// ─── Componente de campo ─────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, keyboardType, error, secureEntry, onToggleSecure, showSecure, multiline, autoCapitalize }) {
  return (
    <View style={f.wrap}>
      <Text style={f.label}>{label}</Text>
      <View style={[f.inputRow, error && f.inputRowError]}>
        <TextInput
          style={[f.input, multiline && { height: 80 }]}
          placeholder={placeholder}
          placeholderTextColor={C.placeholder}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'default'}
          secureTextEntry={secureEntry && !showSecure}
          autoCapitalize={autoCapitalize ?? (secureEntry ? 'none' : 'words')}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
        />
        {secureEntry !== undefined && (
          <TouchableOpacity onPress={onToggleSecure} style={f.eyeBtn}>
            <EyeIcon visible={showSecure} />
          </TouchableOpacity>
        )}
      </View>
      {error ? <Text style={f.error}>{error}</Text> : null}
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.grayBorder, borderRadius: 12, backgroundColor: C.bg, paddingHorizontal: 14, height: 52 },
  inputRowError: { borderColor: C.error },
  input: { flex: 1, fontSize: 15, color: C.navy },
  eyeBtn: { padding: 4 },
  error: { fontSize: 12, color: C.error, marginTop: 4 },
});

// ─── Tela ─────────────────────────────────────────────────────────────────────
export default function CadastroScreen({ navigation }) {
  const [nome, setNome]           = useState('');
  const [email, setEmail]         = useState('');
  const [cpf, setCpf]             = useState('');
  const [telefone, setTelefone]   = useState('');
  const [senha, setSenha]         = useState('');
  const [confirma, setConfirma]   = useState('');
  const [showSenha, setShowSenha]     = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);

  function validate() {
    const e = {};
    if (!nome.trim()) e.nome = 'Nome é obrigatório.';
    if (!email.trim()) e.email = 'E-mail é obrigatório.';
    else if (!validateEmail(email)) e.email = 'E-mail inválido.';
    if (!cpf.trim()) e.cpf = 'CPF é obrigatório.';
    else if (!validateCPF(cpf)) e.cpf = 'CPF inválido.';
    const passErr = validatePassword(senha);
    if (passErr) e.senha = passErr;
    if (senha !== confirma) e.confirma = 'As senhas não conferem.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCadastro() {
    if (!validate()) return;
    setLoading(true);
    try {
      // Tenta cadastrar no backend real
      const data = await apiRegister({
        nome: nome.trim(),
        email: email.trim(),
        senha,
        confirma_senha: confirma,
        cpf: cpf.trim(),
        telefone: telefone.trim(),
      });
      // Guarda token e persiste perfil (restaura sessão ao reabrir o app)
      setAuthToken(data.token);
      await saveToken(data.token);
      await saveProfile({
        nome: data.user.nome,
        email: data.user.email,
        telefone: data.user.telefone ?? '',
        cpf: data.user.cpf ?? '',
        tema: data.user.tema ?? 'claro',
        notificacoes: data.user.notificacoes ?? true,
        token: data.token,
      });
      // Vai direto para a tela principal (já autenticado)
      navigation.navigate('InicioOpcao');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta.';
      Alert.alert('Erro no cadastro', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.navy} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Cadastro</Text>
        </View>

        {/* Título */}
        <Text style={s.title}>Criar conta</Text>
        <Text style={s.subtitle}>Preencha seus dados para começar a se proteger.</Text>

        {/* Formulário */}
        <View style={s.form}>
          <Field label="Nome completo" value={nome} onChangeText={setNome}
            placeholder="Seu nome completo" error={errors.nome} autoCapitalize="words" />
          <Field label="E-mail" value={email} onChangeText={setEmail}
            placeholder="seu@email.com" keyboardType="email-address"
            error={errors.email} autoCapitalize="none" />
          <Field label="CPF" value={cpf} onChangeText={v => setCpf(maskCPF(v))}
            placeholder="000.000.000-00" keyboardType="numeric" error={errors.cpf} autoCapitalize="none" />
          <Field label="Telefone" value={telefone} onChangeText={v => setTelefone(maskPhone(v))}
            placeholder="(11) 9 0000-0000" keyboardType="phone-pad" autoCapitalize="none" />
          <Field label="Senha" value={senha} onChangeText={setSenha}
            placeholder="Mínimo 8 caracteres" secureEntry showSecure={showSenha}
            onToggleSecure={() => setShowSenha(v => !v)} error={errors.senha} />
          <Field label="Confirmar senha" value={confirma} onChangeText={setConfirma}
            placeholder="Repita a senha" secureEntry showSecure={showConfirma}
            onToggleSecure={() => setShowConfirma(v => !v)} error={errors.confirma} />
        </View>

        {/* Senha forte dicas */}
        <View style={s.passwordHints}>
          {[
            { ok: senha.length >= 8, text: 'Mínimo 8 caracteres' },
            { ok: /[A-Z]/.test(senha), text: 'Letra maiúscula' },
            { ok: /[0-9]/.test(senha), text: 'Número' },
          ].map((hint, i) => (
            <View key={i} style={s.hintRow}>
              <View style={[s.hintDot, { backgroundColor: hint.ok ? '#22c55e' : '#d1d5db' }]} />
              <Text style={[s.hintText, hint.ok && { color: '#15803d' }]}>{hint.text}</Text>
            </View>
          ))}
        </View>

        {/* Botão cadastrar */}
        <TouchableOpacity style={s.btnPrimary} onPress={handleCadastro} disabled={loading} activeOpacity={0.88}>
          <Text style={s.btnPrimaryText}>{loading ? 'Criando conta...' : 'Criar conta'}</Text>
        </TouchableOpacity>

        {/* Link login */}
        <View style={s.loginRow}>
          <Text style={s.loginText}>Já tem uma conta?  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
            <Text style={s.loginLink}>Fazer login</Text>
          </TouchableOpacity>
        </View>

        {/* Nota de privacidade */}
        <Text style={s.privacidade}>
          🔒 Seus dados são protegidos conforme a LGPD. Ao criar sua conta, você concorda com os termos de uso e política de privacidade do SheTech.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  scroll:   { paddingTop: SB_H + 8, paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },

  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  backBtn:      { padding: 6, marginRight: 10 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: C.navy },

  title:    { fontSize: 30, fontWeight: '800', color: C.navy, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textMed, marginBottom: 24 },
  form:     { marginBottom: 4 },

  passwordHints: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 20 },
  hintRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  hintDot: { width: 8, height: 8, borderRadius: 4 },
  hintText: { fontSize: 12, color: '#9ca3af' },

  btnPrimary:     { backgroundColor: C.yellow, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: C.navy },

  loginRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  loginText: { fontSize: 14, color: C.textMed },
  loginLink: { fontSize: 14, color: C.navy, fontWeight: '800' },

  privacidade: { fontSize: 12, color: '#9ca3af', textAlign: 'center', lineHeight: 18 },
});
