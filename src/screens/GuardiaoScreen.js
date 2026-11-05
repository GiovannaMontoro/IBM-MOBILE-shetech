/**
 * GuardiaoScreen — Análise de mensagens, imagens e áudio.
 * Referência: Guardiao.tsx
 *
 * Funcionalidades:
 * - Análise de texto (até 2000 chars)
 * - Análise de imagem (JPG, JPEG, PNG, WEBP) via expo-image-picker
 * - Análise de áudio (MP3, WAV, M4A, OGG) via expo-document-picker
 * - Perfis de linguagem: padrão / simplificado
 * - Controle de monitoramento (LGPD)
 * - Indicador de risco visual
 * - Exibição completa dos sinais, anomalias, intervenção
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  ScrollView, Platform, StatusBar, ActivityIndicator,
  Alert, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { analyzeMessage, analyzeFile } from '../services/api';
import { addHistoryEntry } from '../services/storage';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const MAX_LENGTH = 2000;
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const C = {
  navy:    '#002a63',
  blue:    '#1F5FD0',
  yellow:  '#fcd116',
  white:   '#fff',
  gray:    '#f7f8fb',
  muted:   '#57606a',
  border:  '#e5e7eb',
  green:   '#16a34a',
  orange:  '#ea580c',
  red:     '#dc2626',
  darkRed: '#991b1b',
};

const RISK_COLORS = {
  baixo:   { bg: '#f0fdf4', border: '#86efac', text: '#15803d', dot: '#22c55e' },
  médio:   { bg: '#fffbeb', border: '#fde68a', text: '#b45309', dot: '#f59e0b' },
  alto:    { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', dot: '#f97316' },
  crítico: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', dot: '#ef4444' },
};

function ArrowLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7"
        stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ShieldCheck() {
  return (
    <Svg width={26} height={26} viewBox="0 0 24 24">
      <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
      <Path d="m8.5 12 2.6 2.6L16 9.7" stroke={C.navy} strokeWidth={2.2}
        fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

// ─── Gauge de risco ────────────────────────────────────────────────────────────
function RiskBar({ score, label }) {
  const colors = RISK_COLORS[label] ?? RISK_COLORS['baixo'];
  const pct = Math.min(100, Math.max(0, score));
  return (
    <View style={[rs.container, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <View style={rs.header}>
        <View style={[rs.dot, { backgroundColor: colors.dot }]} />
        <Text style={[rs.label, { color: colors.text }]}>
          Risco {label?.toUpperCase()} — {pct}/100
        </Text>
      </View>
      <View style={rs.track}>
        <View style={[rs.fill, { width: `${pct}%`, backgroundColor: colors.dot }]} />
      </View>
    </View>
  );
}
const rs = StyleSheet.create({
  container: { borderRadius: 12, padding: 14, borderWidth: 1, marginBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  label: { fontSize: 14, fontWeight: '700' },
  track: { height: 8, backgroundColor: 'rgba(0,0,0,0.08)', borderRadius: 4, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4 },
});

// ─── Tela principal ────────────────────────────────────────────────────────────
export default function GuardiaoScreen({ navigation }) {
  const [message, setMessage]             = useState('');
  const [profile, setProfile]             = useState('standard');
  const [monitoring, setMonitoring]       = useState(true);
  const [attachment, setAttachment]       = useState(null);
  const [loading, setLoading]             = useState(false);
  const [result, setResult]               = useState(null);
  const [error, setError]                 = useState(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  // ── Selecionar imagem ──────────────────────────────────────────────────────
  async function pickImage() {
    setShowAttachMenu(false);
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permissão necessária', 'Permita acesso à galeria para enviar imagens.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: false,
    });
    if (!res.canceled && res.assets?.[0]) {
      const asset = res.assets[0];
      if (asset.fileSize && asset.fileSize > MAX_BYTES) {
        Alert.alert('Arquivo muito grande', 'O limite é 10 MB.');
        return;
      }
      setAttachment({
        type: 'image',
        uri: asset.uri,
        name: asset.fileName ?? `image_${Date.now()}.jpg`,
        mimeType: asset.mimeType ?? 'image/jpeg',
        size: asset.fileSize ?? 0,
      });
    }
  }

  // ── Selecionar áudio ───────────────────────────────────────────────────────
  async function pickAudio() {
    setShowAttachMenu(false);
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['audio/mpeg', 'audio/wav', 'audio/x-m4a', 'audio/ogg', 'audio/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets?.[0]) {
        const asset = res.assets[0];
        if (asset.size && asset.size > MAX_BYTES) {
          Alert.alert('Arquivo muito grande', 'O limite é 10 MB.');
          return;
        }
        setAttachment({
          type: 'audio',
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType ?? 'audio/mpeg',
          size: asset.size ?? 0,
        });
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível abrir o seletor de arquivos.');
    }
  }

  // ── Enviar análise ─────────────────────────────────────────────────────────
  async function handleSubmit() {
    const hasText = message.trim().length > 0;
    const hasAttachment = attachment !== null;
    if (!hasText && !hasAttachment) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let data;
      if (attachment) {
        data = await analyzeFile({
          file: attachment,
          userId: 'U001',
          languageProfile: profile,
          monitoringConsent: monitoring,
          contextText: message.trim(),
        });
      } else {
        data = await analyzeMessage({
          message,
          user_id: 'U001',
          language_profile: profile,
          monitoring_consent: monitoring,
        });
      }
      setResult(data);
      // Salvar no histórico local
      await addHistoryEntry({
        id: Date.now().toString(),
        type: attachment ? attachment.type : 'mensagem',
        title: attachment ? attachment.name : message.substring(0, 60) + (message.length > 60 ? '…' : ''),
        riskLabel: data.risk_label,
        riskScore: data.risk_score,
        date: new Date().toLocaleString('pt-BR'),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao analisar.';
      setError(msg.startsWith('Erro 5') ? 'Erro interno. Tente novamente em instantes.' : msg);
    } finally {
      setLoading(false);
    }
  }

  // ── Limpar ─────────────────────────────────────────────────────────────────
  function handleClear() {
    setMessage('');
    setAttachment(null);
    setResult(null);
    setError(null);
  }

  function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft />
        </TouchableOpacity>
        <View style={s.headerShield}><ShieldCheck /></View>
        <View style={s.headerText}>
          <Text style={s.headerTitle}>Guardião</Text>
          <Text style={s.headerSub}>IA agêntica contra golpes de engenharia social</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* ── Monitoramento (LGPD) ────────────────────────────────────────── */}
        <View style={[s.card, !monitoring && s.cardOff]}>
          <View style={s.monitorRow}>
            <View style={s.monitorLeft}>
              <View style={[s.monitorDot, monitoring ? s.monitorDotOn : s.monitorDotOff]} />
              <View>
                <Text style={s.monitorTitle}>
                  {monitoring ? 'Monitoramento ativo' : 'Monitoramento pausado'}
                </Text>
                <Text style={s.monitorDesc}>
                  {monitoring
                    ? 'Análise usa seu perfil financeiro sintético para detectar anomalias.'
                    : 'Análise somente da mensagem, sem cruzamento de perfil.'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={[s.pill, monitoring ? s.pillOn : s.pillOff]}
              onPress={() => setMonitoring(v => !v)} activeOpacity={0.8}>
              <Text style={[s.pillText, monitoring ? s.pillTextOn : s.pillTextOff]}>
                {monitoring ? 'Pausar' : 'Ativar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Formulário ──────────────────────────────────────────────────── */}
        <View style={s.card}>

          {/* Perfil de linguagem */}
          <Text style={s.fieldLabel}>Perfil de linguagem</Text>
          <View style={s.profileRow}>
            {[
              { value: 'standard', label: 'Padrão' },
              { value: 'low', label: 'Linguagem simples' },
            ].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={[s.profileBtn, profile === opt.value && s.profileBtnActive]}
                onPress={() => setProfile(opt.value)}
                activeOpacity={0.8}
              >
                <Text style={[s.profileBtnText, profile === opt.value && s.profileBtnTextActive]}>
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Campo de texto */}
          <Text style={s.fieldLabel}>Mensagem suspeita</Text>
          <TextInput
            style={s.textArea}
            placeholder="Cole ou digite aqui a mensagem suspeita que você recebeu…"
            placeholderTextColor="#A0AEC0"
            value={message}
            onChangeText={t => setMessage(t.slice(0, MAX_LENGTH))}
            multiline
            textAlignVertical="top"
            maxLength={MAX_LENGTH}
          />
          <Text style={s.charCount}>{message.length}/{MAX_LENGTH}</Text>

          {/* Anexo */}
          {attachment ? (
            <View style={s.attachPreview}>
              <Text style={s.attachName}>{attachment.type === 'image' ? '🖼️' : '🎧'} {attachment.name}</Text>
              <Text style={s.attachSize}>{formatBytes(attachment.size)}</Text>
              <TouchableOpacity style={s.attachRemove} onPress={() => setAttachment(null)} activeOpacity={0.8}>
                <Text style={s.attachRemoveText}>✕ Remover</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Botão de anexo */}
          <View style={s.actionsRow}>
            <TouchableOpacity style={s.attachBtn} onPress={() => setShowAttachMenu(v => !v)} activeOpacity={0.8}>
              <Text style={s.attachBtnText}>📎 Anexar</Text>
            </TouchableOpacity>
            {(message.trim() || attachment) && (
              <TouchableOpacity style={s.clearBtn} onPress={handleClear} activeOpacity={0.8}>
                <Text style={s.clearBtnText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Menu de tipo de anexo */}
          {showAttachMenu && (
            <View style={s.attachMenu}>
              <TouchableOpacity style={s.attachMenuItem} onPress={pickImage} activeOpacity={0.85}>
                <Text style={s.attachMenuIcon}>🖼️</Text>
                <View>
                  <Text style={s.attachMenuTitle}>Imagem</Text>
                  <Text style={s.attachMenuSub}>JPG, JPEG, PNG, WEBP — até 10 MB</Text>
                </View>
              </TouchableOpacity>
              <View style={s.attachMenuDivider} />
              <TouchableOpacity style={s.attachMenuItem} onPress={pickAudio} activeOpacity={0.85}>
                <Text style={s.attachMenuIcon}>🎧</Text>
                <View>
                  <Text style={s.attachMenuTitle}>Áudio</Text>
                  <Text style={s.attachMenuSub}>MP3, WAV, M4A, OGG — até 10 MB</Text>
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* Botão analisar */}
          <TouchableOpacity
            style={[s.submitBtn, (!message.trim() && !attachment) && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading || (!message.trim() && !attachment)}
            activeOpacity={0.88}
          >
            {loading
              ? <ActivityIndicator color={C.white} />
              : <Text style={s.submitBtnText}>🔍 Analisar mensagem</Text>}
          </TouchableOpacity>
        </View>

        {/* ── Erro ─────────────────────────────────────────────────────────── */}
        {error && (
          <View style={s.errorBox}>
            <Text style={s.errorText}>⚠️ {error}</Text>
          </View>
        )}

        {/* ── Resultado ────────────────────────────────────────────────────── */}
        {result && (
          <View style={s.resultWrap}>

            {/* Gauge */}
            <RiskBar score={result.risk_score} label={result.risk_label} />

            {/* Scores */}
            <View style={s.scoreRow}>
              <View style={s.scoreItem}>
                <Text style={s.scoreLabel}>Nível 1</Text>
                <Text style={s.scoreValue}>{result.level1_score}/100</Text>
              </View>
              <View style={s.scoreItem}>
                <Text style={s.scoreLabel}>Δ Nível 2</Text>
                <Text style={s.scoreValue}>{result.level2_score_delta > 0 ? '+' : ''}{result.level2_score_delta}</Text>
              </View>
              <View style={s.scoreItem}>
                <Text style={s.scoreLabel}>Canal</Text>
                <Text style={s.scoreValue}>{result.input_channel || '—'}</Text>
              </View>
            </View>

            {/* Intervenção */}
            {result.requires_intervention && result.intervention && (
              <View style={s.interventionBox}>
                <Text style={s.interventionTitle}>⚠️ Intervenção recomendada</Text>
                <Text style={s.interventionType}>{result.intervention.scam_name ?? result.intervention.scam_type}</Text>
                {result.intervention.how_it_works && (
                  <Text style={s.interventionHow}>{result.intervention.how_it_works}</Text>
                )}
                <Text style={s.interventionLabel}>Como foi aplicado</Text>
                <Text style={s.interventionHow}>{result.intervention.how_applied}</Text>
                <Text style={s.interventionLabel}>Próximos passos</Text>
                <Text style={s.interventionHow}>{result.intervention.next_step}</Text>
                {result.intervention.alert_signals?.length > 0 && (
                  <>
                    <Text style={s.interventionLabel}>Sinais de alerta</Text>
                    {result.intervention.alert_signals.map((sig, i) => (
                      <Text key={i} style={s.alertSigItem}>• {sig}</Text>
                    ))}
                  </>
                )}
              </View>
            )}

            {/* Mensagem de intervenção */}
            {!!result.intervention_message && (
              <View style={s.msgBox}>
                <Text style={s.msgBoxTitle}>Mensagem de alerta</Text>
                <Text style={s.msgBoxText}>{result.intervention_message}</Text>
              </View>
            )}

            {/* Sinais de risco */}
            {result.signals?.length > 0 && (
              <View style={s.section2}>
                <Text style={s.sectionTitle2}>Sinais identificados</Text>
                {result.signals.map((sig, i) => (
                  <View key={i} style={s.signalItem}>
                    <View style={s.signalHeader}>
                      <Text style={s.signalLabel}>{sig.label}</Text>
                    </View>
                    <Text style={s.signalDesc}>{sig.description}</Text>
                    {!!sig.evidence && <Text style={s.signalEvidence}>Evidência: {sig.evidence}</Text>}
                  </View>
                ))}
              </View>
            )}

            {/* Anomalias */}
            {result.anomalies?.length > 0 && (
              <View style={s.section2}>
                <Text style={s.sectionTitle2}>Anomalias no perfil</Text>
                {result.anomalies.map((an, i) => (
                  <View key={i} style={s.anomalyItem}>
                    <Text style={s.anomalyLabel}>{an.label} ({an.score_delta > 0 ? '+' : ''}{an.score_delta})</Text>
                    <Text style={s.anomalyDesc}>{an.description}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Mensagem de acompanhamento */}
            {!!result.followup_message && (
              <View style={s.followupBox}>
                <Text style={s.followupText}>{result.followup_message}</Text>
              </View>
            )}

            {/* Aviso de revisão humana */}
            {result.requires_human_review && (
              <View style={s.reviewBox}>
                <Text style={s.reviewText}>
                  🔍 Esta análise foi sinalizada para revisão humana adicional.
                </Text>
              </View>
            )}

            {/* Nova análise */}
            <TouchableOpacity style={s.newAnalysisBtn} onPress={handleClear} activeOpacity={0.85}>
              <Text style={s.newAnalysisBtnText}>+ Nova análise</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Privacidade */}
        <View style={s.privBox}>
          <Text style={s.privText}>
            🔒 O texto da mensagem não é registrado em nenhum log.{'\n'}
            Base legal: legítimo interesse para proteção contra fraude (LGPD art. 7º, IX).
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },

  // Header
  header: {
    backgroundColor: C.blue, paddingTop: SB_H + 8, paddingBottom: 16,
    paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center',
  },
  backBtn: { marginRight: 12, padding: 4 },
  headerShield: { marginRight: 12 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Cards
  card: {
    backgroundColor: C.white, margin: 16, marginBottom: 0,
    borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#e5e7eb',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  cardOff: { opacity: 0.7 },

  // Monitoramento
  monitorRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  monitorLeft: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  monitorDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  monitorDotOn: { backgroundColor: '#22c55e' },
  monitorDotOff: { backgroundColor: '#9ca3af' },
  monitorTitle: { fontSize: 14, fontWeight: '700', color: C.navy },
  monitorDesc: { fontSize: 12, color: C.muted, marginTop: 2, lineHeight: 17 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
  pillOn: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  pillOff: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  pillText: { fontSize: 12, fontWeight: '700' },
  pillTextOn: { color: '#15803d' },
  pillTextOff: { color: '#b91c1c' },

  // Formulário
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 8, marginTop: 4 },
  profileRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  profileBtn: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
    borderWidth: 1.5, borderColor: C.border, backgroundColor: '#f7f8fb',
  },
  profileBtnActive: { backgroundColor: C.blue, borderColor: C.blue },
  profileBtnText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  profileBtnTextActive: { color: C.white },
  textArea: {
    borderWidth: 1.5, borderColor: C.border, borderRadius: 12, padding: 14,
    fontSize: 14, color: C.navy, minHeight: 120, maxHeight: 220,
    backgroundColor: '#fafafa', lineHeight: 20,
  },
  charCount: { fontSize: 11, color: C.muted, textAlign: 'right', marginTop: 4, marginBottom: 12 },

  // Anexo
  attachPreview: {
    backgroundColor: '#eef4ff', borderRadius: 10, padding: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  attachName: { fontSize: 13, fontWeight: '600', color: C.navy },
  attachSize: { fontSize: 11, color: C.muted, marginTop: 2 },
  attachRemove: { marginTop: 8, alignSelf: 'flex-start' },
  attachRemoveText: { fontSize: 12, color: '#b91c1c', fontWeight: '600' },

  actionsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  attachBtn: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14,
    borderRadius: 10, borderWidth: 1.5, borderColor: C.border, backgroundColor: '#f7f8fb',
  },
  attachBtnText: { fontSize: 13, color: C.navy, fontWeight: '600' },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1.5, borderColor: '#fecaca' },
  clearBtnText: { fontSize: 13, color: '#b91c1c', fontWeight: '600' },

  attachMenu: {
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1, borderColor: C.border,
    marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  attachMenuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  attachMenuIcon: { fontSize: 28 },
  attachMenuTitle: { fontSize: 14, fontWeight: '700', color: C.navy },
  attachMenuSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  attachMenuDivider: { height: 1, backgroundColor: C.border },

  submitBtn: {
    backgroundColor: C.blue, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#9ca3af' },
  submitBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },

  // Erros
  errorBox: {
    margin: 16, marginBottom: 0, backgroundColor: '#fef2f2',
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#fecaca',
  },
  errorText: { color: '#b91c1c', fontSize: 13, lineHeight: 19 },

  // Resultado
  resultWrap: { margin: 16, marginBottom: 0 },
  scoreRow: {
    flexDirection: 'row', gap: 8, marginBottom: 16,
  },
  scoreItem: {
    flex: 1, backgroundColor: C.white, borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: C.border, alignItems: 'center',
  },
  scoreLabel: { fontSize: 11, color: C.muted, marginBottom: 4 },
  scoreValue: { fontSize: 15, fontWeight: '800', color: C.navy },

  interventionBox: {
    backgroundColor: '#fef2f2', borderRadius: 14, padding: 16, marginBottom: 16,
    borderWidth: 1.5, borderColor: '#fecaca',
  },
  interventionTitle: { fontSize: 15, fontWeight: '800', color: '#991b1b', marginBottom: 8 },
  interventionType: { fontSize: 14, fontWeight: '700', color: '#b91c1c', marginBottom: 8 },
  interventionLabel: { fontSize: 12, fontWeight: '700', color: '#7f1d1d', marginTop: 8, marginBottom: 4 },
  interventionHow: { fontSize: 13, color: '#b91c1c', lineHeight: 19 },
  alertSigItem: { fontSize: 13, color: '#b91c1c', lineHeight: 19, marginBottom: 2 },

  msgBox: {
    backgroundColor: '#fff7ed', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#fed7aa',
  },
  msgBoxTitle: { fontSize: 12, fontWeight: '700', color: '#9a3412', marginBottom: 6 },
  msgBoxText: { fontSize: 13, color: '#c2410c', lineHeight: 19 },

  section2: { marginBottom: 16 },
  sectionTitle2: { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 10 },
  signalItem: {
    backgroundColor: C.white, borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border,
  },
  signalHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  signalLabel: { fontSize: 13, fontWeight: '700', color: C.navy },
  signalDesc: { fontSize: 13, color: C.muted, lineHeight: 18 },
  signalEvidence: { fontSize: 11, color: '#6b7280', marginTop: 4, fontStyle: 'italic' },

  anomalyItem: {
    backgroundColor: '#fffbeb', borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#fde68a',
  },
  anomalyLabel: { fontSize: 13, fontWeight: '700', color: '#b45309', marginBottom: 4 },
  anomalyDesc: { fontSize: 13, color: '#78350f', lineHeight: 18 },

  followupBox: {
    backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#86efac',
  },
  followupText: { fontSize: 13, color: '#15803d', lineHeight: 19 },

  reviewBox: {
    backgroundColor: '#eff6ff', borderRadius: 12, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  reviewText: { fontSize: 13, color: '#1d4ed8', lineHeight: 19 },

  newAnalysisBtn: {
    backgroundColor: '#f0f9ff', borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#bfdbfe', marginBottom: 8,
  },
  newAnalysisBtnText: { color: C.blue, fontWeight: '700', fontSize: 14 },

  // Privacidade
  privBox: {
    margin: 16, backgroundColor: '#f0f9ff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#bfdbfe',
  },
  privText: { fontSize: 12, color: '#1e40af', lineHeight: 18 },
});
