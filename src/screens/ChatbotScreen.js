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
 *
 * Correções Android:
 * - KeyboardAvoidingView behavior="height" para Android
 * - Keyboard.dismiss() ao enviar mensagem
 * - Toque fora do campo fecha o teclado
 * - Respostas locais coerentes por categoria
 * - Fallback com perguntas frequentes como botões clicáveis
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, StatusBar, KeyboardAvoidingView,
  ActivityIndicator, Keyboard, TouchableWithoutFeedback,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { chat } from '../services/api';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

const SAUDACAO = 'Olá! Eu sou o Guardião, seu assistente de segurança digital do Banco do Brasil. Posso ajudar com dúvidas sobre golpes, fraudes, segurança na internet e finanças. Como posso ajudar você hoje?';

const PERGUNTAS_SUGERIDAS = [
  'Como identificar um golpe?',
  'Como me proteger na internet?',
  'O que fazer se caí em um golpe?',
  'O que é phishing?',
  'Como saber se um link é falso?',
  'Como criar uma senha segura?',
  'O que é golpe do Pix?',
  'Como organizar minhas finanças?',
];

function hora() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── Respostas locais por categoria ──────────────────────────────────────────
const CATEGORIAS = [
  {
    chaves: ['oi', 'olá', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'ei', 'hey', 'tudo bem', 'tudo bom', 'opa'],
    resposta: 'Olá! Fico feliz em ajudar. Sou o Guardião, assistente de segurança digital do Banco do Brasil. Você pode me perguntar sobre golpes, phishing, senhas, Pix seguro, ou qualquer dúvida de segurança digital. Por onde quer começar?',
  },
  {
    chaves: ['phishing', 'e-mail falso', 'email falso', 'mensagem falsa', 'link falso'],
    resposta: 'Phishing é uma tentativa de roubo de dados por e-mail, SMS ou mensagem falsa. Principais sinais:\n\n• Remetente desconhecido ou endereço suspeito\n• Urgência excessiva ("Sua conta será bloqueada!")\n• Link que não corresponde ao site oficial\n• Pedido de senha, código ou dados bancários\n\nNunca clique sem verificar. Em caso de dúvida, acesse o site oficial digitando o endereço diretamente no navegador.',
  },
  {
    chaves: ['link', 'url', 'endereço', 'site falso', 'site suspeito'],
    resposta: 'Para identificar links falsos:\n\n• Passe o cursor sobre o link e veja o endereço real\n• Verifique se começa com "https://" e tem cadeado\n• Confira se o domínio é o oficial (ex: bb.com.br, não bb-seguro.com)\n• Desconfie de encurtadores de URL em mensagens não solicitadas\n• Prefira digitar o endereço diretamente no navegador\n\nO Guardião pode analisar textos suspeitos para você na tela principal.',
  },
  {
    chaves: ['senha', 'password', 'segurança da conta', 'conta hackeada', 'autenticação'],
    resposta: 'Dicas para senhas seguras:\n\n• Use ao menos 12 caracteres\n• Misture letras maiúsculas, minúsculas, números e símbolos\n• Não reutilize a mesma senha em sites diferentes\n• Use um gerenciador de senhas confiável\n• Ative a autenticação em dois fatores (2FA) sempre que possível\n• Troque a senha imediatamente se suspeitar de vazamento',
  },
  {
    chaves: ['pix', 'transferência', 'ted', 'doc', 'boleto falso', 'boleto'],
    resposta: 'Golpes com Pix e transferências são comuns. Como se proteger:\n\n• Nunca faça Pix a pedido de mensagens, mesmo que pareçam do banco\n• Confirme sempre o nome do destinatário antes de confirmar\n• Desconfie de pedidos urgentes de filhos ou parentes (pode ser golpe do familiar)\n• Bancos nunca pedem senha ou código de segurança por ligação\n• Verifique no aplicativo oficial qualquer movimentação suspeita',
  },
  {
    chaves: ['golpe', 'fraude', 'scam', 'estelionato', 'caí', 'fui vítima', 'fui enganada', 'fui enganado'],
    resposta: 'Se você caiu em um golpe ou suspeita de fraude, aja rápido:\n\n1. Ligue imediatamente para seu banco pelo número no cartão ou app oficial\n2. Bloqueie cartões e Pix pelo aplicativo\n3. Registre boletim de ocorrência na delegacia ou online (delegaciaonline.pc.sp.gov.br)\n4. Guarde prints, comprovantes e qualquer evidência\n5. Notifique o Banco Central: www.bcb.gov.br\n\nO Guardião pode analisar mensagens suspeitas antes que você tome qualquer ação.',
  },
  {
    chaves: ['engenharia social', 'manipulação', 'pressão', 'urgência'],
    resposta: 'Engenharia social é quando criminosos manipulam pessoas para obter informações ou dinheiro. Táticas comuns:\n\n• Criar urgência falsa ("Sua conta será bloqueada em 2 horas!")\n• Se passar por funcionários de banco, operadoras ou governo\n• Usar informações reais sobre você para ganhar confiança\n• Pedir sigilo ("não conte para ninguém")\n\nDiante de qualquer pressão, pause, respire e verifique pelo canal oficial antes de agir.',
  },
  {
    chaves: ['financ', 'dinheiro', 'investimento', 'guardar', 'poupança', 'reserva', 'orçamento', 'organizar'],
    resposta: 'Dicas básicas de organização financeira:\n\n• Registre todos os seus gastos mensais\n• Separe pelo menos 10% da renda como reserva de emergência\n• Evite parcelamentos com juros altos\n• Priorize quitar dívidas antes de investir\n• Use o BB Decision para simular decisões financeiras antes de tomá-las\n\nQuer fazer uma simulação financeira? Acesse o BB Decision no menu principal.',
  },
  {
    chaves: ['whatsapp', 'telegram', 'sms', 'mensagem'],
    resposta: 'Golpes por mensagem (WhatsApp, SMS, Telegram) são muito comuns. Fique atento:\n\n• Não clique em links recebidos por mensagem, mesmo de contatos conhecidos\n• Desconfie de promoções, sorteios e prêmios\n• O "Golpe do WhatsApp clonado" usa o seu número para pedir dinheiro a seus contatos\n• Ative a verificação em duas etapas no WhatsApp (Configurações > Conta)\n• Use o Guardião para analisar mensagens suspeitas que você receber',
  },
  {
    chaves: ['aplicativo', 'app', 'celular', 'android', 'play store'],
    resposta: 'Cuidado com aplicativos falsos:\n\n• Baixe apps apenas de lojas oficiais (Google Play, App Store)\n• Verifique o desenvolvedor e os comentários antes de instalar\n• Apps do banco nunca pedem senha por notificação ou ligação\n• Não instale apps pedidos por ligação ou mensagem\n• Fique atento às permissões que o app solicita\n• Mantenha o sistema e os apps sempre atualizados',
  },
];

// Perguntas frequentes exibidas como botões no fallback
const FAQ_FALLBACK = [
  'Como identificar um golpe?',
  'O que é phishing?',
  'Como criar uma senha segura?',
  'O que fazer se caí em um golpe?',
];

function respostaLocal(msg) {
  const lower = msg.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const cat of CATEGORIAS) {
    if (cat.chaves.some(k => lower.includes(k.normalize('NFD').replace(/[\u0300-\u036f]/g, '')))) {
      return { texto: cat.resposta, tipo: 'texto' };
    }
  }
  // Sem match → retorna sinal de fallback para exibir FAQ como botões
  return { texto: null, tipo: 'faq' };
}

export default function ChatbotScreen({ navigation }) {
  // Saudação já no estado inicial — evita setState síncrono em useEffect
  const [msgs, setMsgs]             = useState([{ de: 'bot', texto: SAUDACAO, hora: hora() }]);
  const [input, setInput]           = useState('');
  const [loading, setLoading]       = useState(false);
  const [showSugest, setShowSugest] = useState(true);
  const scrollRef                   = useRef(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [msgs]);

  async function perguntar(texto) {
    if (!texto.trim() || loading) return;
    // Fecha o teclado ao enviar (correção Android)
    Keyboard.dismiss();
    setShowSugest(false);
    const pergunta = texto.trim();
    setInput('');
    setMsgs(prev => [...prev, { de: 'user', texto: pergunta, hora: hora() }]);
    setLoading(true);

    try {
      const history = msgs.slice(-10).map(m => ({ role: m.de === 'user' ? 'user' : 'assistant', content: m.texto }));
      const data = await chat({ message: pergunta, history });
      const resposta = data?.response ?? data?.message ?? 'Resposta recebida.';
      setMsgs(prev => [...prev, { de: 'bot', texto: resposta, hora: hora(), tipo: 'texto' }]);
    } catch {
      // Fallback local coerente
      const resultado = respostaLocal(pergunta);
      if (resultado.tipo === 'faq') {
        // Fallback com perguntas frequentes como botões
        setMsgs(prev => [...prev, {
          de: 'bot',
          texto: 'Não tenho certeza sobre isso, mas posso ajudar com os temas mais comuns. Escolha uma das perguntas abaixo ou tente reformular sua dúvida:',
          hora: hora(),
          tipo: 'faq',
          faq: FAQ_FALLBACK,
        }]);
      } else {
        setMsgs(prev => [...prev, { de: 'bot', texto: resultado.texto, hora: hora(), tipo: 'texto' }]);
      }
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

      {/* KeyboardAvoidingView: behavior="height" funciona no Android */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Toque fora do campo fecha o teclado */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
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
                <View style={s.bubbleColumn}>
                  <View style={[s.bubble, msg.de === 'user' ? s.bubbleUser : s.bubbleBot]}>
                    <Text style={[s.bubbleText, msg.de === 'user' ? s.bubbleTextUser : s.bubbleTextBot]}>
                      {msg.texto}
                    </Text>
                    <Text style={[s.bubbleHora, msg.de === 'user' && s.bubbleHoraUser]}>{msg.hora}</Text>
                  </View>
                  {/* Botões FAQ no fallback */}
                  {msg.tipo === 'faq' && msg.faq && (
                    <View style={s.faqWrap}>
                      {msg.faq.map((q, qi) => (
                        <TouchableOpacity
                          key={qi}
                          style={s.faqBtn}
                          onPress={() => perguntar(q)}
                          activeOpacity={0.82}
                        >
                          <Text style={s.faqBtnText}>{q}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
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
        </TouchableWithoutFeedback>

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
            blurOnSubmit={false}
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
  bubbleColumn: { maxWidth: '78%', flexDirection: 'column' },
  bubble: { borderRadius: 18, padding: 12 },
  bubbleUser: { backgroundColor: C.blue, borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: C.white, borderBottomLeftRadius: 4, borderWidth: 1, borderColor: C.border },
  bubbleText: { fontSize: 14, lineHeight: 20 },
  bubbleTextUser: { color: C.white },
  bubbleTextBot: { color: C.navy },
  bubbleHora: { fontSize: 10, color: C.muted, textAlign: 'right', marginTop: 4 },
  bubbleHoraUser: { color: 'rgba(255,255,255,0.65)' },

  // Botões FAQ no fallback
  faqWrap: { marginTop: 8, gap: 6 },
  faqBtn: { backgroundColor: '#eef4ff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 9, borderWidth: 1, borderColor: '#bfdbfe' },
  faqBtnText: { fontSize: 13, color: C.blue, fontWeight: '600' },

  sugestWrap: { maxHeight: 50, borderTopWidth: 1, borderTopColor: C.border, backgroundColor: C.white },
  sugestContent: { paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  sugestChip: { backgroundColor: '#eef4ff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: '#bfdbfe' },
  sugestChipText: { fontSize: 12, color: C.blue, fontWeight: '600' },

  inputBar: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: C.white, borderTopWidth: 1, borderTopColor: C.border, paddingHorizontal: 12, paddingVertical: 8, paddingBottom: Platform.OS === 'android' ? 12 : 24, gap: 8 },
  inputField: { flex: 1, borderWidth: 1.5, borderColor: C.border, borderRadius: 22, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: C.navy, maxHeight: 100, backgroundColor: '#fafafa' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: '#9ca3af' },
});
