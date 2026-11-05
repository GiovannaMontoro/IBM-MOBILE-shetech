import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  bg:         '#FFFFFF',
  navy:       '#1B3A6B',
  blue:       '#1F5FD0',
  yellow:     '#F5C518',
  gray:       '#F4F6FB',
  grayBorder: '#E8ECF4',
  textMed:    '#4A5568',
  placeholder:'#A0AEC0',
  error:      '#E53E3E',
};

const SB_H = Platform.OS === 'android' ? 28 : 44;

// ─── Ícones ───────────────────────────────────────────────────────────────────
function ArrowLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.navy} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={C.placeholder} strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function LockIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="5" y="11" width="14" height="10" rx="2" stroke={C.placeholder} strokeWidth={2} />
      <Path d="M8 11V7a4 4 0 018 0v4" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

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
          <Path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
          <Path d="M1 1l22 22" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
        </>
      )}
    </Svg>
  );
}

export default function LoginScreen({ navigation }) {
  const [cpf, setCpf]             = useState('');
  const [senha, setSenha]         = useState('');
  const [showSenha, setShowSenha] = useState(false);

  return (
    <KeyboardAvoidingView
      style={s.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft />
          </TouchableOpacity>
          <Text style={s.headerTitle}>Login</Text>
        </View>

        {/* Título */}
        <Text style={s.title}>Entrar</Text>
        <Text style={s.subtitle}>Acesse sua conta para continuar.</Text>

        {/* Campos */}
        <View style={s.form}>
          {/* CPF / e-mail */}
          <View style={s.inputRow}>
            <View style={s.inputIcon}><PersonIcon /></View>
            <TextInput
              style={s.input}
              placeholder="CPF ou e-mail"
              placeholderTextColor={C.placeholder}
              value={cpf}
              onChangeText={setCpf}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          {/* Senha */}
          <View style={s.inputRow}>
            <View style={s.inputIcon}><LockIcon /></View>
            <TextInput
              style={[s.input, { flex: 1 }]}
              placeholder="Senha"
              placeholderTextColor={C.placeholder}
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!showSenha}
            />
            <TouchableOpacity style={s.eyeBtn} onPress={() => setShowSenha(v => !v)}>
              <EyeIcon visible={showSenha} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Botão entrar */}
        <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85}
          onPress={() => navigation.navigate('InicioOpcao')}>
          <Text style={s.btnPrimaryText}>Entrar</Text>
        </TouchableOpacity>

        {/* Esqueci senha */}
        <TouchableOpacity style={s.forgotBtn}>
          <Text style={s.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        {/* Cadastro */}
        <View style={s.signupRow}>
          <Text style={s.signupText}>Não tem uma conta?  </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
            <Text style={s.signupLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:     { flex: 1, backgroundColor: C.bg },
  scroll:   { paddingTop: SB_H + 8, paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },

  header:       { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn:      { padding: 6, marginRight: 10 },
  headerTitle:  { fontSize: 18, fontWeight: '700', color: C.navy },

  title:    { fontSize: 34, fontWeight: '800', color: C.navy, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textMed, marginBottom: 32 },

  form:     { marginBottom: 20 },

  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.grayBorder,
    borderRadius: 12,
    backgroundColor: C.bg,
    paddingHorizontal: 14,
    marginBottom: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input:     { flex: 1, fontSize: 15, color: C.navy },
  eyeBtn:    { padding: 4 },

  btnPrimary:     { backgroundColor: C.yellow, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 18 },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: C.navy },

  forgotBtn:  { alignSelf: 'center', marginBottom: 32 },
  forgotText: { fontSize: 14, color: C.navy, textDecorationLine: 'underline', fontWeight: '600' },

  signupRow:  { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  signupText: { fontSize: 14, color: C.textMed },
  signupLink: { fontSize: 14, color: C.navy, fontWeight: '800' },
});
