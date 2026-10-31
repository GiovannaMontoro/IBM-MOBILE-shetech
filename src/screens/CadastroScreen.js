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
  yellow:     '#F5C518',
  gray:       '#F4F6FB',
  grayBorder: '#E8ECF4',
  textMed:    '#4A5568',
  placeholder:'#A0AEC0',
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

function CalendarIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" stroke={C.placeholder} strokeWidth={2} />
      <Path d="M16 2v4M8 2v4M3 10h18" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function MailIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="4" width="20" height="16" rx="2" stroke={C.placeholder} strokeWidth={2} />
      <Path d="M2 7l10 7 10-7" stroke={C.placeholder} strokeWidth={2} strokeLinecap="round" />
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

export default function CadastroScreen({ navigation }) {
  const [nome, setNome]           = useState('');
  const [cpf, setCpf]             = useState('');
  const [email, setEmail]         = useState('');
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
          <Text style={s.headerTitle}>Cadastro</Text>
        </View>

        {/* Título */}
        <Text style={s.title}>Criar conta</Text>
        <Text style={s.subtitle}>Preencha os dados abaixo para{'\n'}começar a usar o Guardião.</Text>

        {/* Campos */}
        <View style={s.form}>
          {/* Nome completo */}
          <View style={s.inputRow}>
            <View style={s.inputIcon}><PersonIcon /></View>
            <TextInput
              style={s.input}
              placeholder="Nome completo"
              placeholderTextColor={C.placeholder}
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
            />
          </View>

          {/* CPF */}
          <View style={s.inputRow}>
            <View style={s.inputIcon}><CalendarIcon /></View>
            <TextInput
              style={s.input}
              placeholder="CPF"
              placeholderTextColor={C.placeholder}
              value={cpf}
              onChangeText={setCpf}
              keyboardType="numeric"
            />
          </View>

          {/* E-mail */}
          <View style={s.inputRow}>
            <View style={s.inputIcon}><MailIcon /></View>
            <TextInput
              style={s.input}
              placeholder="E-mail"
              placeholderTextColor={C.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
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

        {/* Botão cadastrar */}
        <TouchableOpacity style={s.btnPrimary} activeOpacity={0.85}>
          <Text style={s.btnPrimaryText}>Cadastrar</Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: SB_H + 8, paddingHorizontal: 24, paddingBottom: 40, flexGrow: 1 },

  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  backBtn:     { padding: 6, marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: C.navy },

  title:    { fontSize: 34, fontWeight: '800', color: C.navy, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textMed, marginBottom: 32, lineHeight: 20 },

  form: { marginBottom: 20 },

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

  btnPrimary:     { backgroundColor: C.yellow, borderRadius: 12, height: 52, justifyContent: 'center', alignItems: 'center' },
  btnPrimaryText: { fontSize: 17, fontWeight: '800', color: C.navy },
});
