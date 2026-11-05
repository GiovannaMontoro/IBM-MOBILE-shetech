/**
 * MonitoramentoGuardiaoScreen — Apresentação do Guardião.
 * Referência: monitoramentoGuardiao.html
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Platform, StatusBar, Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;

const C = {
  navy:   '#002a63',
  blue:   '#1F5FD0',
  yellow: '#fcd116',
  white:  '#fff',
  gray:   '#f7f8fb',
  muted:  '#57606a',
  border: '#e5e7eb',
};

function ArrowLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white}
        strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ArrowRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor"
        strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function MonitoramentoGuardiaoScreen({ navigation }) {
  const cards = [
    { emoji: '✉️', title: 'Mensagens', sub: 'Testar agora', main: true },
    { emoji: '🔗', title: 'Links', sub: '' },
    { emoji: '🎧', title: 'Áudio', sub: '' },
    { emoji: '🖼️', title: 'Imagem', sub: '' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Cabeçalho azul — dentro do ScrollView para rolar junto */}
        <View style={s.hero}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <ArrowLeft />
          </TouchableOpacity>

          <View style={s.heroText}>
            <View style={s.chip}>
              <View style={s.dot} />
              <Text style={s.chipText}>Monitoramento ativo 24h</Text>
            </View>
            <Text style={s.heroTitle}>Guardião</Text>
            <Text style={s.heroDesc}>
              Sua proteção contra golpes de engenharia social.{'\n'}
              Cole uma mensagem, foto, link ou descrição e a IA{'\n'}
              mostra se há sinais de fraude.
            </Text>
            <TouchableOpacity style={s.ctaBtn}
              onPress={() => navigation.navigate('Guardiao')} activeOpacity={0.88}>
              <Text style={s.ctaText}>Testar mensagem</Text>
              <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                <Path d="M5 12h14M13 6l6 6-6 6" stroke={C.navy}
                  strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
              </Svg>
            </TouchableOpacity>
          </View>

          <Image
            source={require('../../assets/images/MascoteComEscudo2.png')}
            style={s.mascote} resizeMode="contain"
          />
        </View>


        {/* COMO FUNCIONA */}
        <View style={s.section}>
          <Text style={s.h2}>Como o Guardião protege você</Text>
          <View style={s.steps}>
            {[
              { n: '1', t: 'Você compartilha',
                d: 'Cole a mensagem, o link, envie um áudio, foto ou descreva o que recebeu.' },
              { n: '2', t: 'A IA analisa',
                d: 'Procura sinais de golpe e cruza com o seu perfil financeiro sintético.' },
              { n: '3', t: 'Você decide',
                d: 'Recebe o nível de risco, o motivo e o que fazer agora, com explicação simples.' },
            ].map(step => (
              <View key={step.n} style={s.step}>
                <View style={s.stepNum}><Text style={s.stepNumText}>{step.n}</Text></View>
                <View style={s.stepText}>
                  <Text style={s.stepTitle}>{step.t}</Text>
                  <Text style={s.stepDesc}>{step.d}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* O QUE PODEMOS TESTAR */}
        <View style={[s.section, { backgroundColor: C.gray }]}>
          <Text style={s.h2}>O que podemos testar?</Text>
          <View style={s.grid}>
            {cards.map((card, i) => (
              <TouchableOpacity
                key={i}
                style={[s.card, card.main && s.cardMain]}
                onPress={() => navigation.navigate('Guardiao')}
                activeOpacity={0.85}
              >
                <Text style={s.cardEmoji}>{card.emoji}</Text>
                <Text style={[s.cardTitle, card.main && s.cardTitleMain]}>{card.title}</Text>
                {card.main && <Text style={s.cardSub}>Testar agora</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.extraLink}
            onPress={() => navigation.navigate('TesteMensagem')} activeOpacity={0.8}>
            <Text style={s.extraLinkText}>
              Quer treinar o olhar?{' '}
              <Text style={s.extraLinkBold}>{'Faça o quiz "Essa mensagem é um golpe?"'}</Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* PRIVACIDADE */}
        <View style={s.privBox}>
          <Text style={s.privText}>
            🔒 O texto da mensagem não é registrado em nenhum log.{'\n'}
            Base legal: legítimo interesse para proteção contra fraude (LGPD art. 7º, IX).
          </Text>
        </View>

        {/* Rodapé */}
        <View style={s.footer}>
          <Text style={s.footerText}>Um projeto SheTech em parceria com o Banco do Brasil.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1 },

  // Hero
  hero: {
    backgroundColor: C.blue, paddingTop: SB_H + 8, paddingHorizontal: 20,
    paddingBottom: 20, flexDirection: 'row', alignItems: 'flex-start', flexWrap: 'wrap',
  },
  backBtn: { marginBottom: 16, padding: 4, marginRight: 8 },
  heroText: { flex: 1, minWidth: width * 0.55 },
  chip: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e', marginRight: 8 },
  chipText: { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '600' },
  heroTitle: { fontSize: 32, fontWeight: '900', color: C.white, marginBottom: 8 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, marginBottom: 16 },
  ctaBtn: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.yellow,
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, alignSelf: 'flex-start', gap: 8,
  },
  ctaText: { color: C.navy, fontWeight: '800', fontSize: 14 },
  mascote: { width: 110, height: 130, marginTop: -10 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: C.white },
  h2: { fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 16 },

  // Steps
  steps: { gap: 14 },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.blue,
    justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { color: C.white, fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: C.muted, lineHeight: 19 },

  // Grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: (width - 50) / 2, backgroundColor: C.white, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: C.border, alignItems: 'flex-start',
  },
  cardMain: { borderColor: C.blue, backgroundColor: '#eef4ff' },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.navy },
  cardTitleMain: { color: C.blue },
  cardSub: { fontSize: 11, color: C.blue, marginTop: 4, fontWeight: '600' },

  extraLink: { marginTop: 16 },
  extraLinkText: { fontSize: 13, color: C.muted, lineHeight: 19 },
  extraLinkBold: { color: C.blue, fontWeight: '700' },

  privBox: { backgroundColor: '#f0f9ff', margin: 20, borderRadius: 12, padding: 16,
    borderWidth: 1, borderColor: '#bfdbfe' },
  privText: { fontSize: 12, color: '#1e40af', lineHeight: 18 },

  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
