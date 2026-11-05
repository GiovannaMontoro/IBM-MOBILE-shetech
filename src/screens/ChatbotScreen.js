/**
 * ChatbotScreen — Chatbot do Guardião.
 * Referência: chatbot.js
 *
 * Funcionalidades:
 * - Saudação inicial automática
 * - Perguntas sugeridas clicáveis
 * - Campo de mensagem + envio
 * - Indicador de digitação
 * - Histórico da conversa (sessão)
 * - Integra com /api/chat (backend real) com fallback local
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, StatusBar, KeyboardAvoidingView, ActivityIndicator,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { chat } from '../services/api';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

const SAUDACAO = 'Olá! 👋 Eu sou o Guardião, seu assistente virtual. Posso responder perguntas sobre golpes, finanças, tecnologia, estudos e muitos outros assuntos. Como posso ajudar você hoje?';

const PERGUNTAS_SUGERIDAS = [
  'Como identificar um golpe?',
  'Como me proteger na internet?',
  'O que fazer se caí em um golpe?',
  'O que é inteligência artificial?',
  'Como organizar minhas finanças?',
  'O que é phishing?',
  'Como saber se um link é falso?',
  'Como criar uma senha segura?',
];

function hora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// Fallback local simples — usado quando o backend não responde
const RESPOSTAS_LOCAIS = {
  'golpe': 'Golpes geralmente usam urgência, pedidos de dados pessoais e links suspeitos. Nunca forneça senhas ou códigos por mensagem. Em caso de dúvida, ligue diretamente para a empresa pelo número oficial.',
  'phishing': 'Phishing é uma tentativa de roubo de dados por e-mail ou mensagem falsa. Desconfie de remetentes desconhecidos, urgência excessiva e links que não correspondem ao site oficial.',
  'link': 'Antes de clicar em qualquer link, verifique o endereço completo. Prefira digitar o endereço diretamente no navegador ou abrir o aplicativo oficial.',
  'senha': 'Uma senha forte deve ter pelo menos 8 caracteres, misturando letras maiúsculas, minúsculas, números e símbolos. Use um gerenciador de senhas e ative a autenticação em duas etapas.',
  'pix': 'Nunca faça uma transferência Pix a pedido de mensagens ou ligações. Confirme qualquer movimentação diretamente no aplicativo oficial do seu banco.',
  'financ': 'Para organizar suas finanças, comece registrando seus ganhos e gastos mensais. Separe pelo menos 10% da renda para reserva de emergência e evite parcelamentos desnecessários.',
};

function respostaLocal(msg) {
  const lower = msg.toLowerCase();
  for (const [key, resp] of Object.entries(RESPOSTAS_LOCAIS)) {
    if (lower.includes(key)) return resp;
  }
  return 'Entendi sua pergunta! Para respostas mais precisas, certifique-se de que o servidor estiver disponível. Mas posso dizer que, em geral, a segurança digital começa com desconfiança saudável e verificação das informações antes de agir.';
}

export default function ChatbotScreen({ navigation }) {
  const [msgs, setMsgs]           = useState([]);
  const [input, setInput]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showSugest, setShowSugest] = useState(true);
  const scrollRef                 = useRef(null);

  // Saudação inicial
  useEffect(() => {
    setMsgs([{ de: 'bot', texto: SAUDACAO, hora: hora() }]);
  }, []);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs]);

  async function perguntar(texto) {
    if (!texto.trim() || loading) return;
    setShowSugest(false);
    const pergunta = texto.trim();
    setInput('');
    setMsgs(prev => [...prev, { de: 'user', texto: pergunta, hora: hora() }]);
    setLoading(true);

    try {
      // Tenta o backend real
      const history = msgs.slice(-10).map(m => ({ role: m.de === 'user' ? 'user' : 'assistant', content: m.texto }));
      const data = await chat({ message: pergunta, history });
      const resposta = data?.response ?? data?.message ?? 'Resposta recebida.';
      setMsgs(prev => [...prev, { de: 'bot', texto: resposta, hora: hora() }]);
    } catch {
      // Fallback local quando o backend não está disponível
      const resp = respostaLocal(pergunta);
      setMsgs(prev => [...prev, { de: 'bot', texto: resp, hora: hora() }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={s.backBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={s.headerAvatar}>
          <Svg width={22} height={22} viewBox="0 0 24 24">
            <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
            <Path d="m8.5 12 2.6 2.6L16 9.7" stroke={C.navy} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </Svg>
        </View>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Guardião</Text>
          <View style={s.headerStatus}>
            <View style={s.statusDot} />
            <Text style={s.statusText}>Online agora</Text>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        {/* Mensagens */}
        <ScrollView
          ref={scrollRef}
          style={s.log}
          contentContainerStyle={s.logContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {msgs.map((msg, i) => (
            <View key={i} style={[s.linha, msg.de === 'user' ? s.linhaUser : s.linhaBot]}>
              {msg.de === 'bot' && (
                <View style={s.botAvatar}>
                  <Svg width={14} height={14} viewBox="0 0 24 24">
                    <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
                  </Svg>
                </View>
              )}
              <View style={[s.bubble, msg.de === 'user' ? s.bubbleUser : s.bubbleBot]}>
                <Text style={[s.bubbleText, msg.de === 'user' ? s.bubbleTextUser : s.bubbleTextBot]}>
                  {msg.texto}
                </Text>
                <Text style={s.bubbleHora}>{msg.hora}</Text>
              </View>
            </View>
          ))}

          {loading && (
            <View style={[s.linha, s.linhaBot]}>
              <View style={s.botAvatar}>
                <Svg width={14} height={14} viewBox="0 0 24 24">
                  <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
                </Svg>
              </View>
              <View style={[s.bubble, s.bubbleBot, { paddingVertical: 12, paddingHorizontal: 16 }]}>
                <ActivityIndicator size="small" color={C.muted} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Perguntas sugeridas */}
        {showSugest && (
          <ScrollView
            horizontal
            style={s.sugestWrap}
            contentContainerStyle={s.sugestContent}
            showsHorizontalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {PERGUNTAS_SUGERIDAS.map((p, i) => (
              <TouchableOpacity key={i} style={s.sugestChip} onPress={() => perguntar(p)} activeOpacity={0.85}>
                <Text style={s.sugestChipText}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Campo de entrada */}
        <View style={s.inputBar}>
          <TextInput
            style={s.inputField}
            placeholder="Digite sua mensagem..."
            placeholderTextColor="#A0AEC0"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            onSubmitEditing={() => perguntar(input)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[s.sendBtn, (!input.trim() || loading) && s.sendBtnDisabled]}
            onPress={() => perguntar(input)}
            disabled={!input.trim() || loading}
            activeOpacity={0.85}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },

  header: { backgroundColor: C.navy, paddingTop: SB_H + 8, paddingBottom: 12, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 10, padding: 4 },
  headerAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: C.white },
  headerStatus: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22c55e', marginRight: 6 },
  statusText: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },

  log: { flex: 1 },
  logContent: { padding: 16, paddingBottom: 8 },

  linha: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  linhaUser: { justifyContent: 'flex-end' },
  linhaBot: { justifyContent: 'flex-start' },
  botAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: C.navy, justifyContent: 'center', alignItems: 'center', marginRight: 8, marginBottom: 4 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  bubbleUser: { backgroundColor: C.blue, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: C.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: C.white },
  bubbleTextBot: { color: C.navy },
  bubbleHora: { fontSize: 10, color: 'rgba(255,255,255,0.6)', textAlign: 'right', marginTop: 4 },

  sugestWrap: { maxHeight: 50, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white },
  sugestContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  sugestChip: { backgroundColor: '#eef4ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  sugestChipText: { fontSize: 12, color: C.blue, fontWeight: '600' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 12, paddingVertical: 8, paddingBottom: Platform.OS === 'android' ? 12 : 24, gap: 8 },
  inputField: { flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.navy, maxHeight: 100, backgroundColor: '#fafafa' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#9ca3af' },
});
