/**
 * ProfileScreen — Perfil do usuário.
 * Referência: perfil.html
 *
 * Seções:
 * - Avatar + identidade + stats
 * - Dados pessoais (editável)
 * - Segurança (senha + 2FA)
 * - Preferências (tema)
 * - Atividade recente
 * - Zona de perigo
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, Switch, Alert, Dimensions,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { getProfile, saveProfile, getHistory, clearHistory } from '../services/storage';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb', red: '#b91c1c', green: '#15803d' };

function ArrowLeft({ color = C.white }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile2] = useState({ nome: 'Usuário', email: 'usuario@email.com', telefone: '', twoFA: false, theme: 'light' });
  const [editing, setEditing]   = useState(false);
  const [editData, setEditData] = useState({});
  const [history, setHistory2]  = useState([]);
  const [showPassPanel, setShowPassPanel] = useState(false);
  const [senhaAtual, setSenhaAtual]       = useState('');
  const [novaSenha, setNovaSenha]         = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showSenhas, setShowSenhas]       = useState({ atual: false, nova: false, confirma: false });

  const loadData = useCallback(async () => {
    const p = await getProfile();
    if (p) { setProfile2(p); setEditData(p); }
    const h = await getHistory();
    setHistory2(h.slice(0, 5));
  }, []);

  useEffect(() => {
    loadData(); // eslint-disable-line react-hooks/set-state-in-effect
  }, [loadData]);

  function startEdit() {
    setEditData({ ...profile });
    setEditing(true);
  }

  async function saveEdit() {
    await saveProfile({ ...profile, ...editData });
    setProfile2(prev => ({ ...prev, ...editData }));
    setEditing(false);
    Alert.alert('Salvo', 'Dados pessoais atualizados com sucesso.');
  }

  function cancelEdit() {
    setEditData({ ...profile });
    setEditing(false);
  }

  function validarSenha(s) {
    if (s.length < 8) return 'Mínimo 8 caracteres.';
    if (!/[A-Z]/.test(s)) return 'Inclua ao menos uma letra maiúscula.';
    if (!/[0-9]/.test(s)) return 'Inclua ao menos um número.';
    return null;
  }

  function salvarSenha() {
    if (!senhaAtual.trim()) { Alert.alert('Erro', 'Informe a senha atual.'); return; }
    const err = validarSenha(novaSenha);
    if (err) { Alert.alert('Senha inválida', err); return; }
    if (novaSenha !== confirmaSenha) { Alert.alert('Erro', 'As senhas não conferem.'); return; }
    Alert.alert('Senha alterada', 'Sua senha foi atualizada.');
    setSenhaAtual(''); setNovaSenha(''); setConfirmaSenha('');
    setShowPassPanel(false);
  }

  async function toggle2FA(val) {
    const updated = { ...profile, twoFA: val };
    setProfile2(updated);
    await saveProfile(updated);
  }

  async function limparHistorico() {
    Alert.alert('Limpar histórico', 'Isso removerá todas as análises e simulações. Continuar?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpar', style: 'destructive', onPress: async () => {
          await clearHistory();
          setHistory2([]);
          Alert.alert('Histórico limpo', 'Todas as entradas foram removidas.');
        }},
    ]);
  }

  const initials = profile.nome
    ? profile.nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'US';

  const riskIcon = (type) => {
    switch (type) {
      case 'teste-mensagem': return '✉️';
      case 'teste-link': return '🔗';
      case 'teste-transacao': return '💸';
      case 'teste-aplicativo': return '📱';
      case 'simulacao': return '💡';
      case 'mensagem': return '🛡️';
      default: return '📋';
    }
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* Hero */}
      <View style={s.hero}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <ArrowLeft />
        </TouchableOpacity>

        <View style={s.identity}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{initials}</Text>
          </View>
          <View style={s.identityText}>
            <Text style={s.identityName}>{profile.nome}</Text>
            <Text style={s.identityEmail}>{profile.email}</Text>
            <View style={s.badge}>
              <Svg width={14} height={14} viewBox="0 0 24 24">
                <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
                <Path d="m8.5 12 2.6 2.6L16 9.7" stroke={C.navy} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </Svg>
              <Text style={s.badgeText}>Conta protegida</Text>
            </View>
          </View>
        </View>

        <View style={s.stats}>
          <View style={s.stat}><Text style={s.statNum}>{history.length}</Text><Text style={s.statLbl}>Atividades</Text></View>
          <View style={s.statDiv} />
          <View style={s.stat}><Text style={s.statNum}>0</Text><Text style={s.statLbl}>Bloqueios</Text></View>
          <View style={s.statDiv} />
          <View style={s.stat}><Text style={s.statNum}>{history.filter(h => h.type === 'simulacao').length}</Text><Text style={s.statLbl}>Simulações</Text></View>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* ── DADOS PESSOAIS ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Dados pessoais</Text>
          <View style={s.card}>
            <View style={s.formRow}>
              <View style={s.field}>
                <Text style={s.fieldLabel}>Nome de usuário</Text>
                <TextInput
                  style={[s.fieldInput, !editing && s.fieldInputDisabled]}
                  value={editing ? editData.nome : profile.nome}
                  onChangeText={v => setEditData(p => ({ ...p, nome: v }))}
                  editable={editing}
                  placeholderTextColor="#A0AEC0"
                />
              </View>
              <View style={s.field}>
                <Text style={s.fieldLabel}>E-mail</Text>
                <TextInput
                  style={[s.fieldInput, !editing && s.fieldInputDisabled]}
                  value={editing ? editData.email : profile.email}
                  onChangeText={v => setEditData(p => ({ ...p, email: v }))}
                  editable={editing}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#A0AEC0"
                />
              </View>
            </View>
            <View style={s.field}>
              <Text style={s.fieldLabel}>Telefone</Text>
              <TextInput
                style={[s.fieldInput, !editing && s.fieldInputDisabled]}
                value={editing ? editData.telefone : profile.telefone}
                onChangeText={v => setEditData(p => ({ ...p, telefone: v }))}
                editable={editing}
                keyboardType="phone-pad"
                placeholder="(11) 9 0000-0000"
                placeholderTextColor="#A0AEC0"
              />
            </View>
            <View style={s.formActions}>
              {!editing
                ? <TouchableOpacity style={s.btnOutline} onPress={startEdit} activeOpacity={0.85}>
                    <Text style={s.btnOutlineText}>✏️ Editar</Text>
                  </TouchableOpacity>
                : <>
                    <TouchableOpacity style={s.btnGhost} onPress={cancelEdit} activeOpacity={0.85}>
                      <Text style={s.btnGhostText}>Cancelar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnPrimary} onPress={saveEdit} activeOpacity={0.88}>
                      <Text style={s.btnPrimaryText}>Salvar alterações</Text>
                    </TouchableOpacity>
                  </>}
            </View>
          </View>
        </View>

        {/* ── SEGURANÇA ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Segurança</Text>
          <View style={s.card}>
            {/* Senha */}
            <View style={s.rowItem}>
              <View style={[s.rowIcon, { backgroundColor: '#eff6ff' }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x="3" y="11" width="18" height="11" rx="2" stroke={C.blue} strokeWidth={2}/>
                  <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={C.blue} strokeWidth={2} strokeLinecap="round"/>
                </Svg>
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTextTitle}>Senha</Text>
                <Text style={s.rowTextSub}>Última alteração: nunca</Text>
              </View>
              <TouchableOpacity style={s.btnSm} onPress={() => setShowPassPanel(v => !v)} activeOpacity={0.85}>
                <Text style={s.btnSmText}>Alterar</Text>
              </TouchableOpacity>
            </View>

            {showPassPanel && (
              <View style={s.passPanel}>
                <Text style={s.passPanelTitle}>Alterar senha</Text>
                <Text style={s.passPanelSub}>Use pelo menos 8 caracteres, com letra maiúscula, número e símbolo.</Text>
                {[
                  { label: 'Senha atual', key: 'atual', val: senhaAtual, set: setSenhaAtual },
                  { label: 'Nova senha', key: 'nova', val: novaSenha, set: setNovaSenha },
                  { label: 'Confirmar nova senha', key: 'confirma', val: confirmaSenha, set: setConfirmaSenha },
                ].map(f => (
                  <View key={f.key} style={s.field}>
                    <Text style={s.fieldLabel}>{f.label}</Text>
                    <View style={s.passWrap}>
                      <TextInput
                        style={[s.fieldInput, { flex: 1, marginBottom: 0 }]}
                        value={f.val}
                        onChangeText={f.set}
                        secureTextEntry={!showSenhas[f.key]}
                        placeholder="••••••••"
                        placeholderTextColor="#A0AEC0"
                      />
                      <TouchableOpacity onPress={() => setShowSenhas(p => ({ ...p, [f.key]: !p[f.key] }))} style={s.eyeBtn}>
                        <Text>{showSenhas[f.key] ? '👁️' : '🙈'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
                <View style={s.formActions}>
                  <TouchableOpacity style={s.btnGhost} onPress={() => setShowPassPanel(false)} activeOpacity={0.85}>
                    <Text style={s.btnGhostText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.btnPrimary} onPress={salvarSenha} activeOpacity={0.88}>
                    <Text style={s.btnPrimaryText}>Salvar senha</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={s.divider} />

            {/* 2FA */}
            <View style={s.rowItem}>
              <View style={[s.rowIcon, { backgroundColor: '#f0fdf4' }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={C.green} strokeWidth={2} strokeLinejoin="round"/>
                </Svg>
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTextTitle}>Verificação em duas etapas</Text>
                <Text style={s.rowTextSub}>Adicione uma camada extra de proteção.</Text>
              </View>
              <Switch
                value={profile.twoFA}
                onValueChange={toggle2FA}
                trackColor={{ false: '#e5e7eb', true: '#86efac' }}
                thumbColor={profile.twoFA ? C.green : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        {/* ── ATIVIDADE RECENTE ── */}
        <View style={s.section}>
          <View style={s.sectionHead}>
            <Text style={s.sectionTitle}>Atividade recente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Historico')} activeOpacity={0.8}>
              <Text style={s.sectionLink}>Ver histórico completo →</Text>
            </TouchableOpacity>
          </View>
          <View style={s.card}>
            {history.length === 0 ? (
              <View style={s.emptyBox}>
                <Text style={s.emptyText}>Nenhuma atividade registrada ainda.</Text>
              </View>
            ) : history.map((entry, i) => (
              <View key={entry.id ?? i}>
                <View style={s.actItem}>
                  <Text style={s.actIcon}>{riskIcon(entry.type)}</Text>
                  <View style={s.actText}>
                    <Text style={s.actTitle}>{entry.title}</Text>
                    {entry.riskLabel && <Text style={s.actSub}>Risco: {entry.riskLabel}</Text>}
                    {entry.score && <Text style={s.actSub}>Pontuação: {entry.score}</Text>}
                    {entry.resultado && <Text style={s.actSub}>{entry.resultado === 'correto' ? '✓ Correto' : '✗ Incorreto'}</Text>}
                  </View>
                  <Text style={s.actTime}>{entry.date}</Text>
                </View>
                {i < history.length - 1 && <View style={s.divider} />}
              </View>
            ))}
          </View>
        </View>

        {/* ── ZONA DE PERIGO ── */}
        <View style={[s.section, { marginBottom: 32 }]}>
          <Text style={[s.sectionTitle, { color: C.red }]}>Zona de perigo</Text>
          <View style={[s.card, { borderColor: '#fecaca' }]}>
            <View style={s.rowItem}>
              <View style={[s.rowIcon, { backgroundColor: '#fffbeb' }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M3 6h18M8 6V4h8v2" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                  <Rect x="3" y="6" width="18" height="14" rx="2" stroke="#f59e0b" strokeWidth={2}/>
                  <Path d="M10 11v6M14 11v6" stroke="#f59e0b" strokeWidth={2} strokeLinecap="round"/>
                </Svg>
              </View>
              <View style={s.rowText}>
                <Text style={s.rowTextTitle}>Limpar histórico</Text>
                <Text style={s.rowTextSub}>Remove todas as análises e simulações.</Text>
              </View>
              <TouchableOpacity style={[s.btnSm, { borderColor: '#fde68a', backgroundColor: '#fffbeb' }]}
                onPress={limparHistorico} activeOpacity={0.85}>
                <Text style={[s.btnSmText, { color: '#b45309' }]}>Limpar</Text>
              </TouchableOpacity>
            </View>

            <View style={s.divider} />

            <View style={s.rowItem}>
              <View style={[s.rowIcon, { backgroundColor: '#fef2f2' }]}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke={C.red} strokeWidth={2}/>
                  <Path d="M9 9l6 6M15 9l-6 6" stroke={C.red} strokeWidth={2} strokeLinecap="round"/>
                </Svg>
              </View>
              <View style={s.rowText}>
                <Text style={[s.rowTextTitle, { color: C.red }]}>Excluir conta</Text>
                <Text style={s.rowTextSub}>Esta ação é permanente e não pode ser desfeita.</Text>
              </View>
              <TouchableOpacity style={[s.btnSm, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}
                onPress={() => Alert.alert('Excluir conta', 'Esta funcionalidade requer confirmação adicional. Por favor, entre em contato com o suporte.')}
                activeOpacity={0.85}>
                <Text style={[s.btnSmText, { color: C.red }]}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={s.privBox}>
          <Text style={s.privText}>
            🔒 Seus dados são protegidos conforme a LGPD. Não compartilhamos suas informações com terceiros.
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
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },

  // Hero
  hero: { backgroundColor: C.blue, paddingTop: SB_H + 8, paddingBottom: 20, paddingHorizontal: 20 },
  backBtn: { marginBottom: 12, padding: 4, alignSelf: 'flex-start' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: C.navy, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: C.white },
  avatarText: { color: C.white, fontWeight: '800', fontSize: 22 },
  identityText: { flex: 1 },
  identityName: { fontSize: 20, fontWeight: '800', color: C.white },
  identityEmail: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  badge: { flexDirection: 'row', alignItems: 'center', marginTop: 6, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, alignSelf: 'flex-start', gap: 4 },
  badgeText: { fontSize: 11, color: C.white, fontWeight: '600' },

  stats: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 14 },
  stat: { flex: 1, alignItems: 'center' },
  statDiv: { width: 1, backgroundColor: 'rgba(255,255,255,0.3)', marginVertical: 4 },
  statNum: { fontSize: 22, fontWeight: '800', color: C.white },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  // Sections
  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 10 },
  sectionLink: { fontSize: 12, color: C.blue, fontWeight: '600' },

  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: C.border, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 12 },

  // Form
  formRow: { gap: 8, marginBottom: 8 },
  field: { marginBottom: 12 },
  fieldLabel: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 6 },
  fieldInput: { borderWidth: 1.5, borderColor: C.border, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: C.navy, backgroundColor: C.white },
  fieldInputDisabled: { backgroundColor: '#f7f8fb', color: C.muted },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  btnOutline: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  btnOutlineText: { fontSize: 13, color: C.navy, fontWeight: '700' },
  btnGhost: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1.5, borderColor: C.border },
  btnGhostText: { fontSize: 13, color: C.muted, fontWeight: '600' },
  btnPrimary: { flex: 1, backgroundColor: C.blue, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  btnPrimaryText: { color: C.white, fontWeight: '700', fontSize: 13 },

  // Password
  passPanel: { backgroundColor: '#f7f8fb', borderRadius: 12, padding: 14, marginTop: 8 },
  passPanelTitle: { fontSize: 15, fontWeight: '700', color: C.navy, marginBottom: 4 },
  passPanelSub: { fontSize: 12, color: C.muted, marginBottom: 12 },
  passWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: C.border, borderRadius: 10, backgroundColor: C.white },
  eyeBtn: { padding: 10 },

  // Row items
  rowItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  rowText: { flex: 1 },
  rowTextTitle: { fontSize: 14, fontWeight: '700', color: C.navy },
  rowTextSub: { fontSize: 12, color: C.muted, marginTop: 2 },
  btnSm: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1.5, borderColor: C.border },
  btnSmText: { fontSize: 12, fontWeight: '700', color: C.navy },

  // Activity
  actItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 4 },
  actIcon: { fontSize: 20, marginTop: 2 },
  actText: { flex: 1 },
  actTitle: { fontSize: 13, fontWeight: '700', color: C.navy },
  actSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  actTime: { fontSize: 11, color: C.muted },
  emptyBox: { paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, color: C.muted },

  privBox: { margin: 16, backgroundColor: '#f0f9ff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#bfdbfe' },
  privText: { fontSize: 12, color: '#1e40af', lineHeight: 18 },
  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
