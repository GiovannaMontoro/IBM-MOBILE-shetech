/**
 * TesteMensagemScreen — Teste de golpe por mensagem.
 * Referência: testegolpemensagem.html
 *
 * 5 rodadas completas com mensagens, sinais de alerta e feedback detalhado.
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { addHistoryEntry } from '../services/storage';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

// Cada parágrafo = lista de segmentos [texto, tipo]
// tipo: 0 = normal | 1 = trecho suspeito | 2 = link suspeito
const ROUNDS = [
  {
    avatar: '?', sender: 'Remetente desconhecido', sub: 'Mensagem recebida', time: '14:32', golpe: true,
    body: [
      [['🎁 Parabéns! Você foi selecionado para receber um ', 0], ['prêmio exclusivo', 1], ['!', 0]],
      [['Para resgatar, ', 0], ['confirme seus dados pessoais e bancários', 1], [' no endereço:', 0]],
      [['https://premio-exemplo.invalid', 2]],
      [['Atenção: ', 0], ['sua oferta expira hoje!', 1]],
    ],
    explain: 'Prêmios que você não pediu são isca clássica de golpe.',
    signals: [
      'Prêmio inesperado, sem você ter participado de nada.',
      'Pede dados pessoais e bancários.',
      'Link desconhecido, que não é de um site oficial.',
      'Cria urgência: "expira hoje".',
    ],
  },
  {
    avatar: 'BB', sender: 'BB Notificações', sub: 'Mensagem recebida', time: '09:10', golpe: false,
    body: [
      [['Seu código de verificação do app BB é 482913.', 0]],
      [['Não compartilhe este código com ninguém. Se você não fez essa solicitação, ligue para a central no número que está no seu cartão.', 0]],
    ],
    explain: 'Essa mensagem apenas informa algo que você mesmo pediu e não exige nenhuma ação.',
    signals: [
      'Chegou logo depois de você pedir um código no app.',
      'Não pede que você clique em nenhum link.',
      'Avisa para não compartilhar o código.',
      'Manda você procurar a central oficial, pelo número do seu cartão.',
    ],
  },
  {
    avatar: 'M', sender: 'Número novo', sub: 'Mensagem recebida', time: '18:45', golpe: true,
    body: [
      [['Oi mãe, ', 0], ['troquei de número', 1], [', salva esse aqui.', 0]],
      [['Preciso pagar um boleto ', 0], ['urgente', 1], ['. Você consegue ', 0], ['me mandar R$ 800 por Pix agora?', 1]],
      [['Depois eu te explico, tá?', 0]],
    ],
    explain: 'Golpistas fingem ser parentes e pedem dinheiro rápido, antes que você consiga confirmar.',
    signals: [
      'Diz que o número mudou, sem prova de quem é.',
      'Pede dinheiro por Pix com urgência.',
      'Evita explicar e foge de uma ligação.',
      'Como confirmar: ligue para o número antigo da pessoa antes de enviar qualquer valor.',
    ],
  },
  {
    avatar: 'C', sender: 'Clínica Saúde+', sub: 'Mensagem recebida', time: '16:20', golpe: false,
    body: [
      [['Lembrete: sua consulta na Clínica Saúde+ é amanhã, às 9h.', 0]],
      [['Para remarcar, responda SIM ou ligue para o telefone que consta no seu cartão da clínica.', 0]],
    ],
    explain: 'Um lembrete simples, de um serviço que você realmente contratou.',
    signals: [
      'Fala de uma consulta que você realmente marcou.',
      'Não pede dinheiro, senha nem dados bancários.',
      'Não traz links nem anexos.',
      'Indica um canal que você já conhece.',
    ],
  },
  {
    avatar: 'BB', sender: 'BB Segurança', sub: 'Mensagem recebida', time: '23:58', golpe: true,
    body: [
      [['Sua conta será ', 0], ['bloqueada em 2 horas', 1], ['.', 0]],
      [['Atualize seus dados agora para evitar o bloqueio:', 0]],
      [['http://bb-seguranca-app.invalid', 2]],
    ],
    explain: 'O banco nunca pede para você atualizar dados por link enviado em mensagem.',
    signals: [
      'Ameaça de bloqueio com prazo curto para você agir sem pensar.',
      'Link que imita o nome do banco, mas não é o endereço oficial.',
      'Pede que você informe dados por um link, o que o banco não faz.',
      'Como confirmar: abra o app oficial por conta própria e veja se há algum aviso.',
    ],
  },
];

function MessageBubble({ round }) {
  return (
    <View style={mb.bubble}>
      <View style={mb.header}>
        <View style={mb.avatar}><Text style={mb.avatarText}>{round.avatar}</Text></View>
        <View style={mb.senderInfo}>
          <Text style={mb.sender}>{round.sender}</Text>
          <Text style={mb.sub}>{round.sub}</Text>
        </View>
        <Text style={mb.time}>{round.time}</Text>
      </View>
      <View style={mb.body}>
        {round.body.map((par, pi) => (
          <Text key={pi} style={mb.para}>
            {par.map((seg, si) => (
              seg[1] === 1
                ? <Text key={si} style={mb.suspicious}>{seg[0]}</Text>
                : seg[1] === 2
                  ? <Text key={si} style={mb.link}>{seg[0]}</Text>
                  : <Text key={si}>{seg[0]}</Text>
            ))}
          </Text>
        ))}
      </View>
      <View style={mb.footer}>
        <Text style={mb.footerText}>ℹ️ Observe os detalhes antes de tomar uma decisão.</Text>
      </View>
    </View>
  );
}

const mb = StyleSheet.create({
  bubble: { backgroundColor: C.white, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: C.border },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1F5FD0', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  avatarText: { color: C.white, fontWeight: '800', fontSize: 13 },
  senderInfo: { flex: 1 },
  sender: { fontSize: 14, fontWeight: '700', color: C.navy },
  sub: { fontSize: 11, color: C.muted },
  time: { fontSize: 11, color: C.muted },
  body: { marginBottom: 10 },
  para: { fontSize: 13, color: C.navy, lineHeight: 19, marginBottom: 4 },
  suspicious: { color: '#c2410c', backgroundColor: '#fff7ed', borderRadius: 3 },
  link: { color: '#7c3aed', textDecorationLine: 'underline' },
  footer: { backgroundColor: '#f0f9ff', borderRadius: 8, padding: 8 },
  footerText: { fontSize: 11, color: '#1d4ed8' },
});

// ─── Tela ─────────────────────────────────────────────────────────────────────
export default function TesteMensagemScreen({ navigation }) {
  const [step, setStep]           = useState(0);
  const [acertos, setAcertos]     = useState(0);
  const [respondeu, setRespondeu] = useState(false);
  const [escolha, setEscolha]     = useState(null); // true = golpe, false = seguro
  const [finished, setFinished]   = useState(false);

  const total = ROUNDS.length;
  const round = ROUNDS[step];
  const pct   = Math.round((finished ? total : step) / total * 100);

  function responder(escolheuGolpe) {
    if (respondeu) return;
    setRespondeu(true);
    setEscolha(escolheuGolpe);
    if (escolheuGolpe === round.golpe) setAcertos(v => v + 1);
  }

  function avancar() {
    if (step === total - 1) {
      finalizar();
    } else {
      setStep(v => v + 1);
      setRespondeu(false);
      setEscolha(null);
    }
  }

  async function finalizar() {
    setFinished(true);
    await addHistoryEntry({
      id: Date.now().toString(),
      type: 'teste-mensagem',
      title: 'Teste de golpe por mensagem',
      score: `${acertos + (escolha === round.golpe ? 1 : 0)}/${total}`,
      date: new Date().toLocaleString('pt-BR'),
    });
  }

  function reiniciar() {
    setStep(0);
    setAcertos(0);
    setRespondeu(false);
    setEscolha(null);
    setFinished(false);
  }

  const acertosFinais = acertos + (finished && respondeu && escolha === ROUNDS[Math.min(step, total - 1)].golpe ? 1 : 0);

  if (finished) {
    const pctFinal = Math.round((acertosFinais / total) * 100);
    return (
      <View style={s.root}>
        <StatusBar barStyle="light-content" backgroundColor={C.blue} />
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={s.backBtn}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Resultado final</Text>
        </View>
        <ScrollView contentContainerStyle={s.finalContent}>
          <View style={s.ring}>
            <Text style={s.ringScore}>{acertosFinais}/{total}</Text>
            <Text style={s.ringPct}>{pctFinal}%</Text>
          </View>
          <Text style={s.finalTitle}>
            {acertosFinais === total ? 'Excelente! Você está muito atento.' :
              acertosFinais >= 3 ? 'Muito bem! Você está no caminho certo.' :
              'Vale praticar mais.'}
          </Text>
          <Text style={s.finalText}>
            {acertosFinais === total
              ? 'Você identificou todas as mensagens corretamente. Continue desconfiando de urgência, links e pedidos de dinheiro.'
              : acertosFinais >= 3
              ? 'Você acertou boa parte, mas vale revisar os sinais de alerta. Tente de novo para chegar a 5/5.'
              : 'Golpes são feitos para enganar, e todo mundo pode cair. Refaça o teste com calma e observe urgência, links e pedidos de dados ou dinheiro.'}
          </Text>
          <TouchableOpacity style={s.ctaBtn} onPress={() => navigation.navigate('Guardiao')} activeOpacity={0.88}>
            <Text style={s.ctaBtnText}>Analisar uma mensagem real no Guardião →</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.ghostBtn} onPress={reiniciar} activeOpacity={0.85}>
            <Text style={s.ghostBtnText}>Refazer o teste</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.histLink} onPress={() => navigation.navigate('Historico')} activeOpacity={0.8}>
            <Text style={s.histLinkText}>Ver histórico de testes →</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const acertou = respondeu && escolha === round.golpe;

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={s.backBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Teste de golpe por mensagem</Text>
          <Text style={s.headerSub}>Guardião • Treinamento digital</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Progresso */}
        <View style={s.progressWrap}>
          <View style={s.progressLabelRow}>
            <Text style={s.progressLabel}>Pergunta {step + 1} de {total}</Text>
            <Text style={s.progressScore}>Acertos: {acertos}</Text>
          </View>
          <View style={s.progressTrack}>
            <View style={[s.progressFill, { width: `${(step / total) * 100}%` }]} />
          </View>
        </View>

        <View style={s.quizContent}>
          <Text style={s.quizTitle}>Essa mensagem é um golpe?</Text>
          <Text style={s.quizSub}>Leia com atenção. Depois, escolha se ela é segura ou suspeita.</Text>

          <MessageBubble round={round} />

          <Text style={s.perguntaLabel}>O que você acha dessa mensagem?</Text>

          <View style={s.optionsRow}>
            <TouchableOpacity
              style={[s.optionDanger,
                respondeu && escolha === true && (acertou ? s.optionCorrect : s.optionWrong),
                respondeu && round.golpe && s.optionCorrectOutline,
              ]}
              onPress={() => responder(true)}
              disabled={respondeu}
              activeOpacity={0.85}
            >
              <Text style={s.optionIcon}>✕</Text>
              <Text style={s.optionTitle}>É um golpe</Text>
              <Text style={s.optionSub}>Identifiquei sinais suspeitos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.optionSafe,
                respondeu && escolha === false && (!acertou ? s.optionWrong : s.optionCorrect),
                respondeu && !round.golpe && s.optionCorrectOutline,
              ]}
              onPress={() => responder(false)}
              disabled={respondeu}
              activeOpacity={0.85}
            >
              <Text style={s.optionIcon}>✓</Text>
              <Text style={s.optionTitle}>É seguro</Text>
              <Text style={s.optionSub}>A mensagem parece confiável</Text>
            </TouchableOpacity>
          </View>

          {/* Feedback */}
          {respondeu && (
            <View style={[s.feedback, acertou ? s.feedbackOk : s.feedbackBad]}>
              <Text style={s.feedbackTitle}>
                {acertou ? '✓ Você acertou! ' : '✗ Quase! '}
                {round.golpe ? 'Essa mensagem é um golpe.' : 'Essa mensagem é segura.'}
              </Text>
              <Text style={s.feedbackExplain}>{round.explain}</Text>
              <Text style={s.feedbackSubTitle}>{round.golpe ? 'Sinais de alerta' : 'Por que ela é confiável'}</Text>
              {round.signals.map((sig, i) => (
                <Text key={i} style={s.feedbackSig}>• {sig}</Text>
              ))}
              <TouchableOpacity style={s.nextBtn} onPress={avancar} activeOpacity={0.88}>
                <Text style={s.nextBtnText}>
                  {step === total - 1 ? 'Ver resultado final' : 'Próxima mensagem'} →
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity style={s.histLink2} onPress={() => navigation.navigate('Historico')} activeOpacity={0.8}>
            <Text style={s.histLinkText}>Já realizou outros testes? Ver histórico →</Text>
          </TouchableOpacity>
        </View>

        <View style={s.tipBox}>
          <Text style={s.tipText}>
            🔒 Dica: nunca compartilhe senhas, códigos ou dados bancários por links enviados em mensagens inesperadas.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },
  header: { backgroundColor: C.blue, paddingTop: SB_H + 8, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 16, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },

  progressWrap: { paddingHorizontal: 16, paddingTop: 16 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressLabel: { fontSize: 12, color: C.muted },
  progressScore: { fontSize: 12, color: C.muted },
  progressTrack: { height: 6, backgroundColor: '#e5e7eb', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: C.blue, borderRadius: 3 },

  quizContent: { padding: 16 },
  quizTitle: { fontSize: 18, fontWeight: '800', color: C.navy, marginBottom: 4 },
  quizSub: { fontSize: 13, color: C.muted, marginBottom: 16 },
  perguntaLabel: { fontSize: 15, fontWeight: '700', color: C.navy, marginTop: 16, marginBottom: 12 },

  optionsRow: { gap: 10, marginBottom: 12 },
  optionDanger: { backgroundColor: '#fef2f2', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#fecaca', flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionSafe: { backgroundColor: '#f0fdf4', borderRadius: 14, padding: 16, borderWidth: 1.5, borderColor: '#bbf7d0', flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionCorrect: { borderColor: '#22c55e', backgroundColor: '#f0fdf4' },
  optionCorrectOutline: { borderColor: '#22c55e' },
  optionWrong: { borderColor: '#ef4444', backgroundColor: '#fef2f2' },
  optionIcon: { fontSize: 20, width: 28, textAlign: 'center' },
  optionTitle: { fontSize: 14, fontWeight: '700', color: C.navy },
  optionSub: { fontSize: 12, color: C.muted },

  feedback: { borderRadius: 14, padding: 16, marginBottom: 12 },
  feedbackOk: { backgroundColor: '#f0fdf4', borderWidth: 1.5, borderColor: '#86efac' },
  feedbackBad: { backgroundColor: '#fef2f2', borderWidth: 1.5, borderColor: '#fecaca' },
  feedbackTitle: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 8 },
  feedbackExplain: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 10 },
  feedbackSubTitle: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 6 },
  feedbackSig: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 3 },
  nextBtn: { backgroundColor: C.blue, borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 14 },
  nextBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },

  histLink2: { alignItems: 'center', marginTop: 8 },
  histLink: { alignItems: 'center', marginTop: 8 },
  histLinkText: { fontSize: 13, color: C.blue, fontWeight: '600' },

  tipBox: { margin: 16, backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fde68a' },
  tipText: { fontSize: 12, color: '#92400e', lineHeight: 18 },

  // Final
  finalContent: { padding: 24, alignItems: 'center' },
  ring: { width: 120, height: 120, borderRadius: 60, backgroundColor: C.blue, justifyContent: 'center', alignItems: 'center', marginBottom: 24, shadowColor: C.blue, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.35, shadowRadius: 12, elevation: 8 },
  ringScore: { fontSize: 28, fontWeight: '900', color: C.white },
  ringPct: { fontSize: 14, color: 'rgba(255,255,255,0.8)' },
  finalTitle: { fontSize: 20, fontWeight: '800', color: C.navy, textAlign: 'center', marginBottom: 12 },
  finalText: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  ctaBtn: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', width: '100%', marginBottom: 12 },
  ctaBtnText: { color: C.white, fontWeight: '700', fontSize: 14, textAlign: 'center' },
  ghostBtn: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 20, alignItems: 'center', width: '100%', marginBottom: 16 },
  ghostBtnText: { color: C.navy, fontWeight: '700', fontSize: 14 },
});
