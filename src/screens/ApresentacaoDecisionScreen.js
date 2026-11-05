/**
 * ApresentacaoDecisionScreen — Apresentação do BB Decision.
 * Referência: apresentacaoDecision.html
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Platform, StatusBar, Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

export default function ApresentacaoDecisionScreen({ navigation }) {
  const cards = [
    { emoji: '📦', title: 'Parcelamento', main: true },
    { emoji: '📉', title: 'Perda de renda' },
    { emoji: '💼', title: 'Mudar de emprego' },
    { emoji: '🏠', title: 'Comprar uma casa' },
  ];

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero — dentro do ScrollView para rolar junto com o conteúdo */}
        <View style={s.hero}>
          <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
              <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </TouchableOpacity>

          <View style={s.heroBody}>
            <View style={s.heroTextBlock}>
              <View style={s.chip}>
                <View style={s.dot} />
                <Text style={s.chipText}>Simulador de decisões financeiras</Text>
              </View>
              <Text style={s.heroTitle}>BB Decision</Text>
              <Text style={s.heroDesc}>
                Simule decisões financeiras antes de tomá-las. Pergunte como numa conversa
                e veja lado a lado como ficam seus números hoje e no cenário alternativo.
              </Text>
              <TouchableOpacity style={s.ctaBtn}
                onPress={() => navigation.navigate('BBDecision')} activeOpacity={0.88}>
                <Text style={s.ctaText}>Fazer uma simulação</Text>
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Path d="M5 12h14M13 6l6 6-6 6" stroke={C.navy}
                    strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </TouchableOpacity>
            </View>
            <Image source={require('../../assets/images/Amascote.png')}
              style={s.mascote} resizeMode="contain" />
          </View>
        </View>


        {/* COMO FUNCIONA */}
        <View style={s.section}>
          <Text style={s.h2}>Como o Decision ajuda você</Text>
          {[
            { n: '1', t: 'Você pergunta',
              d: 'Escreva um "E se eu...?" do seu jeito, como faria em uma conversa.' },
            { n: '2', t: 'A IA simula',
              d: 'Identifica o cenário, cruza com o seu perfil financeiro sintético e faz as contas.' },
            { n: '3', t: 'Você compara',
              d: 'Vê a situação atual e a alternativa lado a lado, com avisos e as premissas usadas.' },
          ].map(st => (
            <View key={st.n} style={s.step}>
              <View style={s.stepNum}><Text style={s.stepNumText}>{st.n}</Text></View>
              <View style={s.stepText}>
                <Text style={s.stepTitle}>{st.t}</Text>
                <Text style={s.stepDesc}>{st.d}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* O QUE SIMULAR */}
        <View style={[s.section, { backgroundColor: C.gray }]}>
          <Text style={s.h2}>O que você pode simular?</Text>
          <View style={s.grid}>
            {cards.map((card, i) => (
              <TouchableOpacity key={i}
                style={[s.card, card.main && s.cardMain]}
                onPress={() => navigation.navigate('BBDecision')} activeOpacity={0.85}>
                <Text style={s.cardEmoji}>{card.emoji}</Text>
                <Text style={[s.cardTitle, card.main && s.cardTitleMain]}>{card.title}</Text>
                {card.main && <Text style={s.cardSub}>Testar agora</Text>}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={s.extraLink}
            onPress={() => navigation.navigate('MonitoramentoGuardiao')} activeOpacity={0.8}>
            <Text style={s.extraLinkText}>
              Desconfiou de uma mensagem ou link?{' '}
              <Text style={s.extraLinkBold}>Verifique no Guardião</Text> antes de decidir.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Aviso */}
        <View style={s.aviso}>
          <Text style={s.avisoText}>
            ⚠️ As simulações são estimativas para fins educacionais. Não garantem resultados futuros
            nem constituem recomendação de investimento. Os perfis usados são sintéticos (demonstração).
          </Text>
        </View>

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
  hero: { backgroundColor: C.navy, paddingTop: SB_H + 8, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: 'flex-start' },
  heroBody: { flexDirection: 'row', alignItems: 'flex-start' },
  heroTextBlock: { flex: 1 },
  chip: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.yellow, marginRight: 8 },
  chipText: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '600' },
  heroTitle: { fontSize: 30, fontWeight: '900', color: C.white, marginBottom: 8 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 19, marginBottom: 16 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.yellow,
    paddingVertical: 12, paddingHorizontal: 18, borderRadius: 12, alignSelf: 'flex-start', gap: 8 },
  ctaText: { color: C.navy, fontWeight: '800', fontSize: 14 },
  mascote: { width: 110, height: 130, marginTop: -10, marginLeft: 8 },

  section: { paddingHorizontal: 20, paddingVertical: 24, backgroundColor: C.white },
  h2: { fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 16 },

  step: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, marginBottom: 14 },
  stepNum: { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navy,
    justifyContent: 'center', alignItems: 'center', marginTop: 2 },
  stepNumText: { color: C.yellow, fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1 },
  stepTitle: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 4 },
  stepDesc: { fontSize: 13, color: C.muted, lineHeight: 19 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: { width: (width - 50) / 2, backgroundColor: C.white, borderRadius: 14, padding: 16,
    borderWidth: 1.5, borderColor: C.border },
  cardMain: { borderColor: C.navy, backgroundColor: '#f0f4ff' },
  cardEmoji: { fontSize: 28, marginBottom: 8 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: C.navy },
  cardTitleMain: { color: C.navy },
  cardSub: { fontSize: 11, color: C.blue, marginTop: 4, fontWeight: '600' },
  extraLink: { marginTop: 16 },
  extraLinkText: { fontSize: 13, color: C.muted, lineHeight: 19 },
  extraLinkBold: { color: C.blue, fontWeight: '700' },

  aviso: { margin: 16, backgroundColor: '#fffbeb', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#fde68a' },
  avisoText: { fontSize: 12, color: '#92400e', lineHeight: 18 },

  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
