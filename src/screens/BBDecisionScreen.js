/**
 * BBDecisionScreen — Simulador de decisões financeiras.
 * Referência: BBDecision.tsx
 *
 * Funcionalidades:
 * - Campo de pergunta em linguagem natural
 * - Exemplos clicáveis dos 4 cenários
 * - Perfis de linguagem: padrão / simples
 * - Disclaimer sempre visível
 * - Resultado: atual vs. alternativo, avisos, premissas, narrativa
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, StatusBar, ActivityIndicator, Dimensions,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { simulate } from '../services/api';
import { addHistoryEntry } from '../services/storage';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

const EXAMPLE_QUESTIONS = [
  { icon: '📦', title: 'Parcelamento', desc: 'Quanto pesa dividir uma compra no mês',
    text: 'E se eu parcelar em 12x no valor de R$ 1200?', userId: 'U002' },
  { icon: '📉', title: 'Perda de renda', desc: 'Por quanto tempo a reserva aguenta',
    text: 'E se eu perder minha renda por 3 meses?', userId: 'U003' },
  { icon: '💼', title: 'Mudar de emprego', desc: 'Compare a renda atual com a nova',
    text: 'E se eu mudar de emprego e ganhar R$ 6000?', userId: 'U003' },
  { icon: '🏠', title: 'Comprar uma casa', desc: 'Veja entrada, prestação e custo total',
    text: 'E se eu comprar uma casa de R$ 300000 com entrada de R$ 60000?', userId: 'U002' },
];

const SCENARIO_LABELS = {
  parcelamento:     'Parcelamento',
  perda_renda:      'Perda de Renda',
  mudanca_emprego:  'Mudança de Emprego',
  compra_casa:      'Compra de Casa',
  ambiguous:        'Cenário não identificado',
};

function fmt(val) {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Sim' : 'Não';
  if (typeof val === 'number') {
    return val.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
  return String(val);
}

function DataTable({ data }) {
  const entries = Object.entries(data ?? {});
  if (!entries.length) return null;
  return (
    <View style={dt.table}>
      {entries.map(([k, v], i) => (
        <View key={i} style={[dt.row, i % 2 === 0 && dt.rowAlt]}>
          <Text style={dt.key}>{k.replace(/_/g, ' ')}</Text>
          <Text style={dt.val}>{fmt(v)}</Text>
        </View>
      ))}
    </View>
  );
}
const dt = StyleSheet.create({
  table: { borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#e5e7eb' },
  row: { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 12 },
  rowAlt: { backgroundColor: '#f7f8fb' },
  key: { flex: 1, fontSize: 12, color: '#57606a', textTransform: 'capitalize' },
  val: { fontSize: 12, fontWeight: '600', color: '#002a63', textAlign: 'right' },
});

export default function BBDecisionScreen({ navigation }) {
  const [question, setQuestion] = useState('');
  const [userId, setUserId]     = useState('U002');
  const [profile, setProfile]   = useState('standard');
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState(null);
  const [error, setError]       = useState(null);

  async function handleSubmit() {
    if (!question.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await simulate({
        question,
        user_id: userId,
        language_profile: profile,
        simulation_consent: true,
      });
      setResult(data);
      await addHistoryEntry({
        id: Date.now().toString(),
        type: 'simulacao',
        title: question.substring(0, 60) + (question.length > 60 ? '…' : ''),
        scenarioType: data.scenario_type,
        date: new Date().toLocaleString('pt-BR'),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar a simulação.';
      setError(msg.startsWith('Erro 5') ? 'Erro interno. Tente novamente.' : msg);
    } finally {
      setLoading(false);
    }
  }

  function applyExample(ex) {
    setQuestion(ex.text);
    setUserId(ex.userId);
    setResult(null);
    setError(null);
  }

  const scenarioLabel = result ? (SCENARIO_LABELS[result.scenario_type] ?? result.scenario_type) : '';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.navy} />

      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View style={s.headerShield}>
          <Svg width={26} height={26} viewBox="0 0 24 24" fill="none"
            stroke={C.yellow} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
          </Svg>
        </View>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>BB Decision</Text>
          <Text style={s.headerSub}>Simule decisões financeiras antes de tomá-las</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* DISCLAIMER */}
        <View style={s.disclaimer}>
          <Text style={s.disclaimerText}>
            ⚠️ As simulações são estimativas educacionais. Não constituem recomendação financeira
            nem garantem resultados futuros. Perfis sintéticos usados para demonstração.
          </Text>
        </View>

        {/* EXEMPLOS */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Comece por um exemplo</Text>
          <Text style={s.cardSub}>Toque em um cenário para preencher a pergunta.</Text>
          <View style={s.examplesGrid}>
            {EXAMPLE_QUESTIONS.map((ex, i) => (
              <TouchableOpacity key={i} style={s.exampleBtn}
                onPress={() => applyExample(ex)} activeOpacity={0.85}>
                <Text style={s.exampleIcon}>{ex.icon}</Text>
                <Text style={s.exampleTitle}>{ex.title}</Text>
                <Text style={s.exampleDesc}>{ex.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FORMULÁRIO */}
        <View style={s.card}>

          {/* Perfil */}
          <Text style={s.fieldLabel}>Perfil de linguagem</Text>
          <View style={s.profileRow}>
            {[{ value: 'standard', label: 'Padrão' }, { value: 'low', label: 'Linguagem simples' }].map(opt => (
              <TouchableOpacity key={opt.value}
                style={[s.profileBtn, profile === opt.value && s.profileBtnActive]}
                onPress={() => setProfile(opt.value)} activeOpacity={0.8}>
                <Text style={[s.profileBtnText, profile === opt.value && s.profileBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pergunta */}
          <Text style={s.fieldLabel}>Sua pergunta financeira</Text>
          <TextInput
            style={s.textInput}
            placeholder={'E se eu... (ex: parcelar R$ 1200 em 12x?)'}
            placeholderTextColor="#A0AEC0"
            value={question}
            onChangeText={setQuestion}
            multiline
            textAlignVertical="top"
          />

          {/* Botão simular */}
          <TouchableOpacity
            style={[s.submitBtn, !question.trim() && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading || !question.trim()}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.submitBtnText}>💡 Simular agora</Text>}
          </TouchableOpacity>
        </View>

        {/* ERRO */}
        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* RESULTADO */}
        {result && (
          <View style={s.resultWrap}>

            {/* Cenário identificado */}
            <View style={s.scenarioBadge}>
              <Text style={s.scenarioLabel}>Cenário: {scenarioLabel}</Text>
            </View>

            {/* Pergunta entendida */}
            {!!result.question_understood && (
              <View style={s.understoodBox}>
                <Text style={s.understoodTitle}>Como entendemos sua pergunta</Text>
                <Text style={s.understoodText}>{result.question_understood}</Text>
              </View>
            )}

            {/* Clarificação necessária */}
            {result.clarification_needed && result.clarification_question && (
              <View style={s.clarifyBox}>
                <Text style={s.clarifyTitle}>Precisamos de mais informações</Text>
                <Text style={s.clarifyText}>{result.clarification_question}</Text>
              </View>
            )}

            {/* Comparação lado a lado */}
            {!result.clarification_needed && (
              <View style={s.compareRow}>
                <View style={[s.compareCard, s.compareCardCurrent]}>
                  <Text style={s.compareCardTitle}>Situação Atual</Text>
                  <Text style={s.compareCardName}>{result.current_path?.label}</Text>
                  <DataTable data={result.current_path?.data} />
                </View>
                <View style={[s.compareCard, s.compareCardAlt]}>
                  <Text style={s.compareCardTitle}>Cenário Alternativo</Text>
                  <Text style={s.compareCardName}>{result.alternative_path?.label}</Text>
                  <DataTable data={result.alternative_path?.data} />
                </View>
              </View>
            )}

            {/* Delta */}
            {result.delta && Object.keys(result.delta).length > 0 && (
              <View style={s.section2}>
                <Text style={s.section2Title}>Diferença entre cenários</Text>
                <DataTable data={result.delta} />
              </View>
            )}

            {/* Narrativa */}
            {!!result.narrative && (
              <View style={s.narrativeBox}>
                <Text style={s.narrativeTitle}>Análise</Text>
                <Text style={s.narrativeText}>{result.narrative}</Text>
              </View>
            )}

            {/* Avisos */}
            {result.warnings?.length > 0 && (
              <View style={s.section2}>
                <Text style={s.section2Title}>Avisos importantes</Text>
                {result.warnings.map((w, i) => (
                  <View key={i} style={s.warnItem}>
                    <Text style={s.warnText}>⚠️ {w}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Premissas */}
            {result.assumptions?.length > 0 && (
              <View style={s.section2}>
                <Text style={s.section2Title}>Premissas utilizadas</Text>
                {result.assumptions.map((a, i) => (
                  <Text key={i} style={s.assumptionText}>• {a}</Text>
                ))}
              </View>
            )}

            {/* Disclaimer */}
            {!!result.disclaimer && (
              <View style={s.disclaimerBottom}>
                <Text style={s.disclaimerBottomText}>{result.disclaimer}</Text>
              </View>
            )}

            {/* Nova simulação */}
            <TouchableOpacity style={s.newBtn}
              onPress={() => { setResult(null); setQuestion(''); }} activeOpacity={0.85}>
              <Text style={s.newBtnText}>+ Nova simulação</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>Um projeto SheTech em parceria com o Banco do Brasil.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },

  header: { backgroundColor: C.navy, paddingTop: SB_H + 8, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  headerShield: { marginRight: 12 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },

  disclaimer: { margin: 16, marginBottom: 0, backgroundColor: '#fffbeb', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#fde68a' },
  disclaimerText: { fontSize: 12, color: '#92400e', lineHeight: 18 },

  card: { backgroundColor: C.white, margin: 16, marginBottom: 0, borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 4 },
  cardSub: { fontSize: 13, color: C.muted, marginBottom: 16 },

  examplesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  exampleBtn: { width: (width - 64) / 2, backgroundColor: '#f0f4ff', borderRadius: 12, padding: 12,
    borderWidth: 1.5, borderColor: '#bfdbfe' },
  exampleIcon: { fontSize: 26, marginBottom: 6 },
  exampleTitle: { fontSize: 13, fontWeight: '700', color: C.navy },
  exampleDesc: { fontSize: 11, color: C.muted, marginTop: 2 },

  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 8, marginTop: 4 },
  profileRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  profileBtn: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#f7f8fb' },
  profileBtnActive: { backgroundColor: C.navy, borderColor: C.navy },
  profileBtnText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  profileBtnTextActive: { color: C.white },
  textInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 12, padding: 14,
    fontSize: 14, color: C.navy, minHeight: 100, backgroundColor: '#fafafa', lineHeight: 20, marginBottom: 16 },

  submitBtn: { backgroundColor: C.navy, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#9ca3af' },
  submitBtnText: { color: C.yellow, fontWeight: '800', fontSize: 15 },

  errorBox: { margin: 16, marginBottom: 0, backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fecaca' },
  errorText: { color: '#b91c1c', fontSize: 13, lineHeight: 19 },

  resultWrap: { margin: 16, marginBottom: 0 },
  scenarioBadge: { backgroundColor: '#f0fdf4', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, alignSelf: 'flex-start', marginBottom: 12, borderWidth: 1, borderColor: '#86efac' },
  scenarioLabel: { fontSize: 12, fontWeight: '700', color: '#15803d' },

  understoodBox: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: C.border },
  understoodTitle: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 6 },
  understoodText: { fontSize: 13, color: C.muted, lineHeight: 19 },

  clarifyBox: { backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#fde68a' },
  clarifyTitle: { fontSize: 13, fontWeight: '700', color: '#b45309', marginBottom: 6 },
  clarifyText: { fontSize: 13, color: '#78350f', lineHeight: 19 },

  compareRow: { gap: 12, marginBottom: 16 },
  compareCard: { backgroundColor: C.white, borderRadius: 14, padding: 14, borderWidth: 1.5 },
  compareCardCurrent: { borderColor: '#bfdbfe', backgroundColor: '#eff6ff' },
  compareCardAlt: { borderColor: '#86efac', backgroundColor: '#f0fdf4' },
  compareCardTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, color: C.muted, marginBottom: 4 },
  compareCardName: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 10 },

  section2: { marginBottom: 16 },
  section2Title: { fontSize: 13, fontWeight: '700', color: C.navy, marginBottom: 8 },

  narrativeBox: { backgroundColor: C.white, borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: C.border },
  narrativeTitle: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 6 },
  narrativeText: { fontSize: 13, color: C.muted, lineHeight: 20 },

  warnItem: { backgroundColor: '#fffbeb', borderRadius: 10, padding: 10, marginBottom: 6, borderWidth: 1, borderColor: '#fde68a' },
  warnText: { fontSize: 12, color: '#92400e', lineHeight: 18 },

  assumptionText: { fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 2 },

  disclaimerBottom: { backgroundColor: '#f7f8fb', borderRadius: 10, padding: 12, marginBottom: 12 },
  disclaimerBottomText: { fontSize: 11, color: '#6b7280', lineHeight: 17 },

  newBtn: { backgroundColor: '#f0f9ff', borderRadius: 12, paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#bfdbfe', marginBottom: 8 },
  newBtnText: { color: C.blue, fontWeight: '700', fontSize: 14 },

  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border, marginTop: 16 },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
