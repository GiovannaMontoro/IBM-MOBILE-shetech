/**
 * MenuScreen — Menu completo de navegação.
 * Todos os destinos do app em um só lugar.
 */
import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Platform, StatusBar, Image,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

const MENU_ITEMS = [
  {
    section: 'Principal',
    items: [
      { icon: '🏠', label: 'Início', sub: 'Página principal do app', screen: 'InicioOpcao' },
    ],
  },
  {
    section: 'Guardião',
    items: [
      { icon: '🛡️', label: 'Guardião', sub: 'Apresentação e recursos', screen: 'MonitoramentoGuardiao' },
      { icon: '🔍', label: 'Analisar mensagem', sub: 'Análise com IA de texto, imagem e áudio', screen: 'Guardiao' },
    ],
  },
  {
    section: 'BB Decision',
    items: [
      { icon: '💡', label: 'BB Decision', sub: 'Apresentação do simulador', screen: 'ApresentacaoDecision' },
      { icon: '📊', label: 'Fazer simulação', sub: 'Simule decisões financeiras', screen: 'BBDecision' },
    ],
  },
  {
    section: 'Educação',
    items: [
      { icon: '📚', label: 'Aprender', sub: 'Biblioteca sobre golpes e fraudes', screen: 'Aprender' },
      { icon: '✉️', label: 'Teste de mensagem', sub: '5 mensagens para identificar', screen: 'TesteMensagem' },
      { icon: '🔗', label: 'Teste de link', sub: 'Identifique links suspeitos', screen: 'TesteLink' },
      { icon: '💸', label: 'Teste de transação', sub: 'Identifique transações suspeitas', screen: 'TesteTransacoes' },
      { icon: '📱', label: 'Teste de aplicativo', sub: 'Identifique apps suspeitos', screen: 'TesteAplicativos' },
    ],
  },
  {
    section: 'Conta',
    items: [
      { icon: '👤', label: 'Perfil', sub: 'Dados, segurança e preferências', screen: 'Profile' },
      { icon: '📋', label: 'Histórico', sub: 'Todas as análises e testes realizados', screen: 'Historico' },
      { icon: '💬', label: 'Chatbot', sub: 'Assistente virtual do Guardião', screen: 'Chatbot' },
    ],
  },
];

export default function MenuScreen({ navigation }) {
  function navTo(screen) {
    navigation.navigate(screen);
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
        <View>
          <Text style={s.headerTitle}>Menu</Text>
          <Text style={s.headerSub}>Acesso a todas as funcionalidades</Text>
        </View>
        {/* Logo */}
        <Svg width={28} height={28} viewBox="0 0 24 24" style={{ marginLeft: 'auto' }}>
          <Path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z" fill={C.yellow}/>
          <Path d="m8.5 12 2.6 2.6L16 9.7" stroke={C.navy} strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </Svg>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>
        {MENU_ITEMS.map((section, si) => (
          <View key={si} style={s.section}>
            <Text style={s.sectionLabel}>{section.section}</Text>
            <View style={s.sectionCard}>
              {section.items.map((item, ii) => (
                <View key={ii}>
                  <TouchableOpacity style={s.menuItem} onPress={() => navTo(item.screen)} activeOpacity={0.8}>
                    <View style={s.menuIconWrap}>
                      <Text style={s.menuIcon}>{item.icon}</Text>
                    </View>
                    <View style={s.menuText}>
                      <Text style={s.menuLabel}>{item.label}</Text>
                      <Text style={s.menuSub}>{item.sub}</Text>
                    </View>
                    <Text style={s.menuArrow}>›</Text>
                  </TouchableOpacity>
                  {ii < section.items.length - 1 && <View style={s.divider} />}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Sair */}
        <View style={s.section}>
          <View style={s.sectionCard}>
            <TouchableOpacity style={s.menuItem}
              onPress={() => navigation.navigate('Login')} activeOpacity={0.8}>
              <View style={[s.menuIconWrap, { backgroundColor: '#fef2f2' }]}>
                <Text style={s.menuIcon}>🚪</Text>
              </View>
              <View style={s.menuText}>
                <Text style={[s.menuLabel, { color: '#b91c1c' }]}>Sair</Text>
                <Text style={s.menuSub}>Volta para a tela de login</Text>
              </View>
              <Text style={s.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerBrand}>SheTech × Banco do Brasil</Text>
          <Text style={s.footerText}>Um projeto SheTech em parceria com o Banco do Brasil.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7f8fb' },
  scroll: { flex: 1 },
  header: { backgroundColor: C.navy, paddingTop: SB_H + 8, paddingBottom: 14, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  section: { paddingHorizontal: 16, paddingTop: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: C.muted, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
  sectionCard: { backgroundColor: C.white, borderRadius: 16, borderWidth: 1, borderColor: C.border, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  menuIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#eef4ff', justifyContent: 'center', alignItems: 'center' },
  menuIcon: { fontSize: 20 },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: C.navy },
  menuSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  menuArrow: { fontSize: 22, color: C.muted, fontWeight: '300' },
  divider: { height: 1, backgroundColor: C.border, marginLeft: 66 },

  footer: { padding: 24, alignItems: 'center', paddingBottom: 32 },
  footerBrand: { fontSize: 14, fontWeight: '800', color: C.navy, marginBottom: 4 },
  footerText: { fontSize: 12, color: C.muted },
});
