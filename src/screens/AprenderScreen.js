/**
 * AprenderScreen — Área de conteúdo educativo sobre golpes.
 * Referência: aprender.html
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Platform, StatusBar, Dimensions,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;
const C = { navy: '#002a63', blue: '#1F5FD0', yellow: '#fcd116', white: '#fff', gray: '#f7f8fb', muted: '#57606a', border: '#e5e7eb' };

const TOPICS = [
  {
    id: 'phishing',
    icon: '🛡️',
    title: 'Phishing',
    sub: 'Mensagens e e-mails falsos',
    tags: 'phishing mensagens emails falsos',
    body: 'Mensagens ou e-mails que imitam uma empresa conhecida para roubar seus dados.',
    subTitle: 'Como se proteger',
    tips: [
      'Confira o endereço de quem enviou antes de abrir qualquer coisa.',
      'Desconfie de urgência, ameaças e prazos curtos.',
      'Nunca informe senhas ou códigos por mensagem.',
    ],
  },
  {
    id: 'falsas-ofertas',
    icon: '🏷️',
    title: 'Falsas ofertas',
    sub: 'Promoções que parecem demais',
    tags: 'falsas ofertas promocoes',
    body: 'Promoções boas demais para ser verdade, usadas para pedir pagamento ou dados pessoais.',
    subTitle: 'Como se proteger',
    tips: [
      'Compare o preço com o site ou o app oficial da loja.',
      'Desconfie de prêmios e sorteios que você não pediu.',
      'Pague apenas em ambientes que você mesmo abriu, nunca por link recebido.',
    ],
  },
  {
    id: 'links-suspeitos',
    icon: '🔗',
    title: 'Links suspeitos',
    sub: 'Não clique em links desconhecidos',
    tags: 'links suspeitos nao clique',
    body: 'Endereços que parecem oficiais, mas levam a páginas falsas que capturam seus dados.',
    subTitle: 'Como se proteger',
    tips: [
      'Veja o endereço completo antes de tocar no link.',
      'Prefira digitar o site ou abrir o aplicativo oficial.',
      'Tenha cuidado com links encurtados e com letras trocadas no endereço.',
    ],
  },
  {
    id: 'golpe-telefone',
    icon: '📞',
    title: 'Golpes por telefone',
    sub: 'Se passam por bancos e empresas',
    tags: 'golpes telefone banco ligacao',
    body: 'Ligações de falsos atendentes que pedem dados, códigos ou transferências.',
    subTitle: 'Como se proteger',
    tips: [
      'Desligue e ligue de volta para o número oficial da empresa.',
      'Nenhuma instituição séria pede senha ou código por telefone.',
      'Não instale aplicativos a pedido de quem ligou.',
    ],
  },
  {
    id: 'redes-sociais',
    icon: '👥',
    title: 'Redes sociais',
    sub: 'Perfis falsos e engenharia social',
    tags: 'redes sociais perfis falsos engenharia social',
    body: 'Perfis falsos ou clonados que se passam por conhecidos e pedem dinheiro ou dados.',
    subTitle: 'Como se proteger',
    tips: [
      'Confirme por outro canal, como uma ligação, antes de ajudar.',
      'Desconfie de pedidos urgentes de dinheiro, mesmo de contatos conhecidos.',
      'Ative a verificação em duas etapas nas suas contas.',
    ],
  },
  {
    id: 'golpe-pix',
    icon: '💸',
    title: 'Golpes de Pix',
    sub: 'Transferências e chaves falsas',
    tags: 'pix transferencia golpe chave',
    body: 'Golpistas pedem devolução de Pix enviado por engano ou usam chaves falsas para desviar pagamentos.',
    subTitle: 'Como se proteger',
    tips: [
      'Nunca devolva valores para uma chave Pix enviada por desconhecidos.',
      'Verifique toda movimentação no app oficial do banco antes de agir.',
      'Bancos não solicitam devoluções por mensagem ou ligação.',
    ],
  },
  {
    id: 'apps-falsos',
    icon: '📱',
    title: 'Aplicativos falsos',
    sub: 'Apps que pedem permissões excessivas',
    tags: 'aplicativos falsos permissoes',
    body: 'Aplicativos enviados por arquivo ou mensagem que solicitam acesso desnecessário ao celular.',
    subTitle: 'Como se proteger',
    tips: [
      'Instale aplicativos somente por lojas oficiais (Play Store, App Store).',
      'Verifique quem é o desenvolvedor antes de instalar.',
      'Desconfie de apps que pedem acesso a contatos, mensagens ou arquivos.',
    ],
  },
  {
    id: 'outros',
    icon: '🤔',
    title: 'Outros golpes',
    sub: 'Conheça mais e se proteja',
    tags: 'outros golpes',
    body: 'Existem muitas variações de golpe, mas quase todas usam pressa e pedem dados ou dinheiro.',
    subTitle: 'Como se proteger',
    tips: [
      'Pare e respire antes de agir.',
      'Converse com alguém de confiança antes de decidir.',
      'Bloqueie o contato e denuncie na plataforma.',
    ],
  },
];

function TopicCard({ topic, onPress, expanded }) {
  return (
    <View style={tc.card}>
      <TouchableOpacity style={tc.header} onPress={onPress} activeOpacity={0.85}>
        <Text style={tc.icon}>{topic.icon}</Text>
        <View style={tc.headerText}>
          <Text style={tc.title}>{topic.title}</Text>
          <Text style={tc.sub}>{topic.sub}</Text>
        </View>
        <Text style={[tc.arrow, expanded && tc.arrowOpen]}>›</Text>
      </TouchableOpacity>
      {expanded && (
        <View style={tc.body}>
          <Text style={tc.bodyText}>{topic.body}</Text>
          <Text style={tc.subTitle}>{topic.subTitle}</Text>
          {topic.tips.map((tip, i) => (
            <Text key={i} style={tc.tip}>• {tip}</Text>
          ))}
        </View>
      )}
    </View>
  );
}

const tc = StyleSheet.create({
  card: { backgroundColor: C.white, borderRadius: 14, marginBottom: 10, borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  icon: { fontSize: 26, marginRight: 12 },
  headerText: { flex: 1 },
  title: { fontSize: 15, fontWeight: '700', color: C.navy },
  sub: { fontSize: 12, color: C.muted, marginTop: 2 },
  arrow: { fontSize: 24, color: C.blue, fontWeight: '300' },
  arrowOpen: { transform: [{ rotate: '90deg' }] },
  body: { paddingHorizontal: 14, paddingBottom: 14 },
  bodyText: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 10 },
  subTitle: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 6 },
  tip: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 3 },
});

export default function AprenderScreen({ navigation }) {
  const [search, setSearch]   = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = search.trim()
    ? TOPICS.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.tags.toLowerCase().includes(search.toLowerCase())
      )
    : TOPICS;

  function toggle(id) {
    setExpanded(prev => (prev === id ? null : id));
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* Cabeçalho */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} activeOpacity={0.8}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.white} strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
        <View>
          <Text style={s.headerTitle}>Aprender</Text>
          <Text style={s.headerSub}>Biblioteca sobre golpes e fraudes</Text>
        </View>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Busca */}
        <View style={s.searchWrap}>
          <Text style={s.searchIcon}>🔍</Text>
          <TextInput
            style={s.searchInput}
            placeholder="Pesquisar tópico..."
            placeholderTextColor="#A0AEC0"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')} activeOpacity={0.8}>
              <Text style={s.searchClear}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={s.content}>
          <Text style={s.sectionTitle}>{filtered.length} tópicos encontrados</Text>
          {filtered.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              expanded={expanded === topic.id}
              onPress={() => toggle(topic.id)}
            />
          ))}
          {filtered.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyText}>Nenhum tópico encontrado para "{search}".</Text>
            </View>
          )}
        </View>

        {/* Seção de testes */}
        <View style={s.testsSection}>
          <Text style={s.testsSectionTitle}>Teste seus conhecimentos</Text>
          <Text style={s.testsSectionSub}>Coloque em prática o que aprendeu com os testes educativos.</Text>

          <View style={s.testsGrid}>
            {[
              { emoji: '✉️', title: 'Golpe por mensagem', screen: 'TesteMensagem' },
              { emoji: '🔗', title: 'Links suspeitos', screen: 'TesteLink' },
              { emoji: '💸', title: 'Transações', screen: 'TesteTransacoes' },
              { emoji: '📱', title: 'Aplicativos', screen: 'TesteAplicativos' },
            ].map((t, i) => (
              <TouchableOpacity key={i} style={s.testCard}
                onPress={() => navigation.navigate(t.screen)} activeOpacity={0.85}>
                <Text style={s.testEmoji}>{t.emoji}</Text>
                <Text style={s.testTitle}>{t.title}</Text>
                <Text style={s.testCta}>Testar →</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Link para Guardião */}
        <View style={s.ctaBox}>
          <Text style={s.ctaTitle}>Recebeu uma mensagem suspeita?</Text>
          <Text style={s.ctaSub}>Use o Guardião para analisar com inteligência artificial.</Text>
          <TouchableOpacity style={s.ctaBtn}
            onPress={() => navigation.navigate('MonitoramentoGuardiao')} activeOpacity={0.88}>
            <Text style={s.ctaBtnText}>Ir para o Guardião →</Text>
          </TouchableOpacity>
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
  header: { backgroundColor: C.blue, paddingTop: SB_H + 8, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12, padding: 4 },
  headerTitle: { fontSize: 20, fontWeight: '900', color: C.white },
  headerSub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },

  searchWrap: { margin: 16, marginBottom: 8, flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.white, borderRadius: 12, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14, height: 48 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: C.navy },
  searchClear: { fontSize: 14, color: C.muted, padding: 4 },

  content: { paddingHorizontal: 16 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  empty: { alignItems: 'center', paddingVertical: 32 },
  emptyText: { fontSize: 14, color: C.muted },

  testsSection: { margin: 16, backgroundColor: C.blue, borderRadius: 16, padding: 20 },
  testsSectionTitle: { fontSize: 18, fontWeight: '800', color: C.white, marginBottom: 4 },
  testsSectionSub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 16 },
  testsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  testCard: { width: (width - 62) / 2, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  testEmoji: { fontSize: 24, marginBottom: 8 },
  testTitle: { fontSize: 13, fontWeight: '700', color: C.white, marginBottom: 4 },
  testCta: { fontSize: 12, color: C.yellow, fontWeight: '600' },

  ctaBox: { margin: 16, backgroundColor: '#eef4ff', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#bfdbfe' },
  ctaTitle: { fontSize: 16, fontWeight: '800', color: C.navy, marginBottom: 4 },
  ctaSub: { fontSize: 13, color: C.muted, marginBottom: 16 },
  ctaBtn: { backgroundColor: C.blue, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, alignSelf: 'flex-start' },
  ctaBtnText: { color: C.white, fontWeight: '700', fontSize: 14 },

  footer: { paddingVertical: 20, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
