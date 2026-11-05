/**
 * TesteLinkScreen — Teste de link suspeito.
 * Referência: testelink.html
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { addHistoryEntry } from '../services/storage';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

export default function TesteLinkScreen({ navigation }) {
  const [selecionado, setSelecionado] = useState(null); // 'golpe' | 'seguro'
  const [mostrou, setMostrou]         = useState(false);

  const isGolpe = true; // Resposta correta para este caso

  async function verResultado() {
    if (!selecionado) return;
    setMostrou(true);
    await addHistoryEntry({
      id: Date.now().toString(),
      type: 'teste-link',
      title: 'Teste de link suspeito',
      resultado: selecionado === 'golpe' ? 'correto' : 'incorreto',
      date: new Date().toLocaleString('pt-BR'),
    });
  }

  const correto = selecionado === 'golpe';

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
          <Text style={s.headerTitle}>Teste de link</Text>
          <Text style={s.headerSub}>Guardião • Treinamento digital</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.card}>
          <Text style={s.cardTitle}>Esse link é seguro?</Text>

          <View style={s.msgBox}>
            <Text style={s.msgText}>
              Atenção! Sua conta bancária será bloqueada hoje.{'\n'}
              Acesse o link abaixo para confirmar seus dados:{'\n'}
              <Text style={s.msgLink}>https://banco-seguranca.example</Text>
            </Text>
            <View style={s.msgFooter}>
              <Text>🔗</Text><Text style={s.msgTime}>10:45</Text>
            </View>
          </View>

          <View style={s.optionsRow}>
            <TouchableOpacity
              style={[s.optGolpe, selecionado === 'golpe' && s.optSelected]}
              onPress={() => { setSelecionado('golpe'); setMostrou(false); }}
              activeOpacity={0.85}
            >
              <Text style={s.optEmoji}>🛡️</Text>
              <Text style={s.optTitle}>É um golpe</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.optSeguro, selecionado === 'seguro' && s.optSelectedGreen]}
              onPress={() => { setSelecionado('seguro'); setMostrou(false); }}
              activeOpacity={0.85}
            >
              <Text style={s.optEmoji}>✅</Text>
              <Text style={s.optTitle}>É seguro</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.verBtn, !selecionado && s.verBtnDisabled]}
            onPress={verResultado}
            disabled={!selecionado}
            activeOpacity={0.88}
          >
            <Text style={s.verBtnText}>Ver resultado</Text>
          </TouchableOpacity>

          {mostrou && (
            <View style={[s.resultado, correto ? s.resultadoOk : s.resultadoBad]}>
              <Text style={s.resultadoText}>
                {correto
                  ? '✅ Parabéns! Você identificou corretamente o golpe. O endereço é suspeito e tenta imitar um serviço bancário. Nunca informe seus dados em links recebidos por mensagens.'
                  : '⚠️ Atenção! Esse link é suspeito. Golpistas podem criar páginas falsas para roubar dados bancários. Sempre confira o endereço oficial do banco.'}
              </Text>
            </View>
          )}

          <TouchableOpacity style={s.histLink} onPress={() => navigation.navigate('Historico')} activeOpacity={0.8}>
            <Text style={s.histLinkText}>Já testou algum link? Ver histórico →</Text>
          </TouchableOpacity>
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
  headerTitle: { fontSize: 18, fontWeight: '800', color: C.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.7)' },
  card: { margin: 16, backgroundColor: C.white, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardTitle: { fontSize: 18, fontWeight: '800', color: C.navy, marginBottom: 16 },
  msgBox: { backgroundColor: '#f7f8fb', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: C.border },
  msgText: { fontSize: 14, color: C.navy, lineHeight: 21 },
  msgLink: { color: '#7c3aed', textDecorationLine: 'underline' },
  msgFooter: { flexDirection: 'row', gap: 6, marginTop: 8 },
  msgTime: { fontSize: 12, color: C.muted },
  optionsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  optGolpe: { flex: 1, backgroundColor: '#fef2f2', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#fecaca' },
  optSeguro: { flex: 1, backgroundColor: '#f0fdf4', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#bbf7d0' },
  optSelected: { borderColor: '#ef4444', backgroundColor: '#fee2e2' },
  optSelectedGreen: { borderColor: '#22c55e', backgroundColor: '#dcfce7' },
  optEmoji: { fontSize: 28, marginBottom: 8 },
  optTitle: { fontSize: 14, fontWeight: '700', color: C.navy, textAlign: 'center' },
  verBtn: { backgroundColor: C.navy, borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 16 },
  verBtnDisabled: { backgroundColor: '#9ca3af' },
  verBtnText: { color: C.white, fontWeight: '800', fontSize: 15 },
  resultado: { borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1 },
  resultadoOk: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  resultadoBad: { backgroundColor: '#fef2f2', borderColor: '#fecaca' },
  resultadoText: { fontSize: 13, color: C.navy, lineHeight: 19 },
  histLink: { alignItems: 'center' },
  histLinkText: { fontSize: 13, color: C.blue, fontWeight: '600' },
});
