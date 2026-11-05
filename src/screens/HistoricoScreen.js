/**
 * HistoricoScreen — Histórico de testes e análises.
 * Referência: historicotestes.html
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, RefreshControl,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { getHistory, clearHistory } from '../services/storage';
import { useFocusEffect } from '@react-navigation/native';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb', red: '#b91c1c' };

const TYPE_ICONS = {
  'teste-mensagem':  { icon: '✉️', label: 'Teste de mensagem' },
  'teste-link':      { icon: '🔗', label: 'Teste de link' },
  'teste-transacao': { icon: '💸', label: 'Teste de transação' },
  'teste-aplicativo':{ icon: '📱', label: 'Teste de aplicativo' },
  'simulacao':       { icon: '💡', label: 'Simulação BB Decision' },
  'mensagem':        { icon: '🛡️', label: 'Análise Guardião' },
  'image':           { icon: '🖼️', label: 'Análise de imagem' },
  'audio':           { icon: '🎧', label: 'Análise de áudio' },
};

const RISK_COLORS = {
  baixo:   { bg: '#f0fdf4', border: '#86efac', text: '#15803d' },
  médio:   { bg: '#fffbeb', border: '#fde68a', text: '#b45309' },
  alto:    { bg: '#fff7ed', border: '#fed7aa', text: '#c2410c' },
  crítico: { bg: '#fef2f2', border: '#fecaca', text: '#b91c1c' },
};

export default function HistoricoScreen({ navigation }) {
  const [history, setHistory2] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  async function loadHistory() {
    const h = await getHistory();
    setHistory2(h);
  }

  async function onRefresh() {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }

  const typeInfo = (type) => TYPE_ICONS[type] ?? { icon: '📋', label: type };

  const riskBadge = (riskLabel) => {
    if (!riskLabel) return null;
    const colors = RISK_COLORS[riskLabel] ?? { bg: '#f7f8fb', border: C.border, text: C.muted };
    return (
      <View style={[badge.wrap, { backgroundColor: colors.bg, borderColor: colors.border }]}>
        <Text style={[badge.text, { color: colors.text }]}>{riskLabel.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.8} style={s.backBtn}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Histórico de testes</Text>
          <Text style={s.headerSub}>Todas as análises e simulações realizadas.</Text>
        </View>
      </View>

      <ScrollView
        style={s.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.blue} />}
      >
        {history.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyIcon}>📋</Text>
            <Text style={s.emptyTitle}>Nenhum teste realizado ainda</Text>
            <Text style={s.emptySub}>Realize análises no Guardião ou testes educativos para que apareçam aqui.</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => navigation.navigate('MonitoramentoGuardiao')} activeOpacity={0.88}>
              <Text style={s.emptyBtnText}>Ir para o Guardião →</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.list}>
            <Text style={s.listLabel}>{history.length} registro{history.length !== 1 ? 's' : ''}</Text>
            {history.map((entry, i) => {
              const info = typeInfo(entry.type);
              return (
                <View key={entry.id ?? i} style={s.item}>
                  <Text style={s.itemIcon}>{info.icon}</Text>
                  <View style={s.itemText}>
                    <Text style={s.itemTitle} numberOfLines={2}>{entry.title}</Text>
                    <Text style={s.itemType}>{info.label}</Text>
                    {entry.score && <Text style={s.itemMeta}>Pontuação: {entry.score}</Text>}
                    {entry.resultado && (
                      <Text style={[s.itemMeta, { color: entry.resultado === 'correto' ? '#15803d' : C.red }]}>
                        {entry.resultado === 'correto' ? '✓ Identificou corretamente' : '✗ Identificação incorreta'}
                      </Text>
                    )}
                    <Text style={s.itemDate}>{entry.date}</Text>
                  </View>
                  {riskBadge(entry.riskLabel)}
                </View>
              );
            })}
          </View>
        )}

        <View style={s.footer}>
          <Text style={s.footerText}>Um projeto SheTech em parceria com o Banco do Brasil.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const badge = StyleSheet.create({
  wrap: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  text: { fontSize: 11, fontWeight: '700' },
});

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },
  header: { backgroundColor: C.blue, paddingTop: SB_H + 8, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 1 },

  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: C.navy, textAlign: 'center', marginBottom: 8 },
  emptySub: { fontSize: 14, color: C.muted, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  emptyBtn: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24 },
  emptyBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },

  list: { padding: 16 },
  listLabel: { fontSize: 12, color: C.muted, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  item: { backgroundColor: C.white, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'flex-start', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  itemIcon: { fontSize: 24, marginTop: 2 },
  itemText: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: C.navy, marginBottom: 2 },
  itemType: { fontSize: 12, color: C.muted, marginBottom: 2 },
  itemMeta: { fontSize: 12, color: C.muted },
  itemDate: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border, marginTop: 8 },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
