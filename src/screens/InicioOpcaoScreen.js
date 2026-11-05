/**
 * InicioOpcaoScreen — Página principal do app após login.
 * Referência: inicialopcao.html
 * 
 * Contém:
 * - Hero com slogan + imagem celulares
 * - Meus acessos: Guardião + BB Decision
 * - Como funciona (3 passos)
 * - Aprender sobre golpes (accordion)
 * - Simulador quiz
 * - Banner final com dupla mascotes
 */
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  Image, Platform, StatusBar, Dimensions,
} from 'react-native';
import Svg, {
  Path, Circle, Rect, Defs,
  LinearGradient as SvgLinear, Stop,
} from 'react-native-svg';

const { width } = Dimensions.get('window');
const SB_H = Platform.OS === 'android' ? 28 : 44;

const C = {
  navy:    '#002a63',
  blue:    '#1F5FD0',
  yellow:  '#fcd116',
  white:   '#fff',
  gray:    '#f7f8fb',
  text:    '#1f2328',
  muted:   '#57606a',
  border:  '#e5e7eb',
  green:   '#1a7a4a',
};

// ─── Ícones inline ────────────────────────────────────────────────────────────
function ShieldIcon({ size = 28, color = C.blue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2.5 L19.5 5.5 V11 C19.5 15.8 16.4 19.6 12 21.5 C7.6 19.6 4.5 15.8 4.5 11 V5.5 Z"
        stroke={color} strokeWidth={1.7} strokeLinejoin="round"/>
      <Circle cx="12" cy="11.3" r="3.6" stroke={color} strokeWidth={1.6}/>
      <Path d="M10.4 11.4 L11.6 12.6 L13.8 10.2" stroke={color} strokeWidth={1.6}
        strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}

function BarChartIcon({ size = 26, color = '#ffd21f' }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="13" width="4" height="7" rx="1" fill={color}/>
      <Rect x="10" y="9" width="4" height="11" rx="1" fill={color}/>
      <Rect x="16" y="4" width="4" height="16" rx="1" fill={color}/>
    </Svg>
  );
}

function HomeIcon({ active }) {
  const c = active ? C.navy : '#8A94A6';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 11 12 3l9 8" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M5 10v10h14V10" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
      <Path d="M10 20v-6h4v6" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"/>
    </Svg>
  );
}
function LearnIcon({ active }) {
  const c = active ? C.navy : '#8A94A6';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M12 6v14" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
      <Path d="M3 5h6a3 3 0 0 1 3 3v12a2.5 2.5 0 0 0-2.5-2.5H3z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/>
      <Path d="M21 5h-6a3 3 0 0 0-3 3v12a2.5 2.5 0 0 1 2.5-2.5H21z" stroke={c} strokeWidth={1.8} strokeLinejoin="round"/>
    </Svg>
  );
}
function ProfileIcon({ active }) {
  const c = active ? C.navy : '#8A94A6';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={c} strokeWidth={1.8}/>
      <Path d="M4 21c1-4 4-6 8-6s7 2 8 6" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}
function MenuIcon({ active }) {
  const c = active ? C.navy : '#8A94A6';
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 6h18M3 12h18M3 18h18" stroke={c} strokeWidth={1.8} strokeLinecap="round"/>
    </Svg>
  );
}

// ─── Accordion item ───────────────────────────────────────────────────────────
function AccordionItem({ title, subtitle, icon, children }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={s.accordion}>
      <TouchableOpacity style={s.accordionHeader} onPress={() => setOpen(v => !v)} activeOpacity={0.8}>
        <View style={s.accordionIcon}>{icon}</View>
        <View style={s.accordionText}>
          <Text style={s.accordionTitle}>{title}</Text>
          <Text style={s.accordionSub}>{subtitle}</Text>
        </View>
        <Text style={[s.accordionArrow, open && s.accordionArrowOpen]}>›</Text>
      </TouchableOpacity>
      {open && <View style={s.accordionBody}>{children}</View>}
    </View>
  );
}

// ─── Mini Quiz (simulador da página inicial) ──────────────────────────────────
const QUIZ_PERGUNTA = 'Alguém liga dizendo ser do seu banco e pede o código que acabou de chegar por SMS. O que você faz?';
const QUIZ_OPCOES = [
  { letra: 'A', texto: 'Passo o código para confirmar minha identidade', correta: false,
    titulo: 'Cuidado: isso é um golpe.',
    detalhe: 'O código de SMS é pessoal. Nenhuma instituição legítima pede esse número por telefone.' },
  { letra: 'B', texto: 'Desligo e ligo para o número oficial do banco', correta: true,
    titulo: 'Correto: você evitou o golpe.',
    detalhe: 'Desligar e retornar por um canal oficial é a forma mais segura de confirmar qualquer contato.' },
  { letra: 'C', texto: 'Peço o nome do atendente e continuo a conversa', correta: false,
    titulo: 'Quase, mas ainda arriscado.',
    detalhe: 'Golpistas dão nomes falsos com facilidade. O melhor é encerrar a chamada e verificar por conta própria.' },
];

function MiniQuiz() {
  const [selected, setSelected] = useState(null);
  const feedback = selected !== null ? QUIZ_OPCOES[selected] : null;

  return (
    <View style={s.quizBox}>
      <Text style={s.quizEtapa}>Situação 1 de 5</Text>
      <Text style={s.quizPergunta}>{QUIZ_PERGUNTA}</Text>
      {QUIZ_OPCOES.map((op, idx) => (
        <TouchableOpacity
          key={idx}
          style={[
            s.quizOpcao,
            selected === idx && (op.correta ? s.quizCorreta : s.quizErrada),
          ]}
          onPress={() => setSelected(idx)}
          activeOpacity={0.85}
        >
          <View style={s.quizLetraBox}><Text style={s.quizLetra}>{op.letra}</Text></View>
          <Text style={s.quizTexto}>{op.texto}</Text>
        </TouchableOpacity>
      ))}
      {feedback && (
        <View style={[s.quizFeedback, feedback.correta ? s.quizFeedbackOk : s.quizFeedbackBad]}>
          <Text style={s.quizFeedbackTitulo}>{feedback.titulo}</Text>
          <Text style={s.quizFeedbackTexto}>{feedback.detalhe}</Text>
        </View>
      )}
    </View>
  );
}

// ─── Tela principal ───────────────────────────────────────────────────────────
export default function InicioOpcaoScreen({ navigation }) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.blue} />

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <TouchableOpacity style={s.navItem} activeOpacity={0.8}>
          <HomeIcon active={true} /><Text style={s.navLabelActive}>Início</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} activeOpacity={0.8}
          onPress={() => navigation.navigate('Aprender')}>
          <LearnIcon /><Text style={s.navLabel}>Aprender</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} activeOpacity={0.8}
          onPress={() => navigation.navigate('Profile')}>
          <ProfileIcon /><Text style={s.navLabel}>Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.navItem} activeOpacity={0.8}
          onPress={() => navigation.navigate('Menu')}>
          <MenuIcon /><Text style={s.navLabel}>Menu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} showsVerticalScrollIndicator={false}>

        {/* HERO */}
        <View style={s.hero}>
          <View style={s.heroBg} />
          <View style={s.heroContent}>
            <View style={s.pill}>
              <ShieldIcon size={14} color={C.blue}/>
              <Text style={s.pillText}>Olá, Que bom ter você por aqui!</Text>
            </View>
            <Text style={s.heroTitle}>Sua defesa <Text style={s.heroDestaque}>em ação.</Text></Text>
            <Text style={s.heroLead}>O Guardião está pronto. Analise, simule e proteja — quando e como você precisar.</Text>
            <TouchableOpacity style={s.btnOutline} onPress={() => navigation.navigate('TesteMensagem')} activeOpacity={0.85}>
              <Text style={s.btnOutlineText}>Experimentar o simulador</Text>
            </TouchableOpacity>
          </View>
          <Image source={require('../../assets/images/celulares1.png')}
            style={s.heroImg} resizeMode="contain"
            defaultSource={require('../../assets/images/fundo.png')} />
        </View>

        {/* MEUS ACESSOS */}
        <View style={s.section}>
          <Text style={s.eyebrow}>Meus acessos</Text>
          <Text style={s.sectionTitle}>Por onde você quer começar?</Text>
          <View style={s.acessos}>
            <TouchableOpacity style={s.acessoAzul}
              onPress={() => navigation.navigate('MonitoramentoGuardiao')} activeOpacity={0.88}>
              <View style={s.acessoIconWrap}>
                <ShieldIcon size={30} color={C.navy}/>
              </View>
              <Text style={s.acessoTitulo}>Guardião</Text>
              <Text style={s.acessoDesc}>Monitore, teste e se proteja de golpes.</Text>
              <View style={s.btnBrancoRow}>
                <Text style={s.btnBrancoText}>Acessar</Text>
                <Text style={s.arrowBlue}> →</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={s.acessoAmarelo}
              onPress={() => navigation.navigate('ApresentacaoDecision')} activeOpacity={0.88}>
              <View style={s.acessoIconWrapDark}>
                <BarChartIcon size={28}/>
              </View>
              <Text style={s.acessoTituloNavy}>BB Decision</Text>
              <Text style={s.acessoDescNavy}>Simule, aprenda e tome melhores decisões.</Text>
              <View style={s.btnEscuroRow}>
                <Text style={s.btnEscuroText}>Acessar</Text>
                <Text style={s.arrowYellow}> →</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* COMO FUNCIONA */}
        <View style={[s.section, s.sectionAlt]}>
          <Text style={s.eyebrow}>Como funciona</Text>
          <Text style={s.sectionTitle}>Três passos para não cair em golpes</Text>
          <View style={s.passos}>
            {[
              { n: '1', t: 'Receba a mensagem', d: 'Chegou um link, um áudio ou uma ligação estranha? Traga o conteúdo para o Guardião antes de agir.' },
              { n: '2', t: 'Analise os sinais', d: 'Urgência, pedidos de código, links diferentes do oficial. O Guardião mostra o que merece desconfiança.' },
              { n: '3', t: 'Decida com segurança', d: 'Receba um alerta claro e saiba o próximo passo: ignorar, bloquear ou denunciar.' },
            ].map(p => (
              <View key={p.n} style={s.passo}>
                <View style={s.passoNumCircle}><Text style={s.passoNum}>{p.n}</Text></View>
                <Text style={s.passoTitulo}>{p.t}</Text>
                <Text style={s.passoDesc}>{p.d}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* APRENDER SOBRE GOLPES */}
        <View style={[s.section, s.sectionAzulClaro]}>
          <Text style={s.eyebrow}>Biblioteca</Text>
          <Text style={s.sectionTitle}>Aprender sobre golpes</Text>

          <AccordionItem title="Phishing" subtitle="Mensagens e e-mails falsos."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Mensagens ou e-mails que imitam uma empresa conhecida para roubar seus dados.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Confira o endereço de quem enviou antes de abrir qualquer coisa.</Text>
            <Text style={s.topicoBullet}>• Desconfie de urgência, ameaças e prazos curtos.</Text>
            <Text style={s.topicoBullet}>• Nunca informe senhas ou códigos por mensagem.</Text>
          </AccordionItem>

          <AccordionItem title="Falsas ofertas" subtitle="Promoções que parecem demais."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Promoções boas demais para ser verdade, usadas para pedir pagamento ou dados pessoais.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Compare o preço com o site ou o app oficial da loja.</Text>
            <Text style={s.topicoBullet}>• Desconfie de prêmios e sorteios que você não pediu.</Text>
            <Text style={s.topicoBullet}>• Pague apenas em ambientes que você mesmo abriu.</Text>
          </AccordionItem>

          <AccordionItem title="Links suspeitos" subtitle="Não clique em links desconhecidos."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Endereços que parecem oficiais, mas levam a páginas falsas que capturam seus dados.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Veja o endereço completo antes de tocar no link.</Text>
            <Text style={s.topicoBullet}>• Prefira digitar o site ou abrir o aplicativo oficial.</Text>
            <Text style={s.topicoBullet}>• Tenha cuidado com links encurtados e com letras trocadas.</Text>
          </AccordionItem>

          <AccordionItem title="Golpes por telefone" subtitle="Se passam por bancos e empresas."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Ligações de falsos atendentes que pedem dados, códigos ou transferências.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Desligue e ligue de volta para o número oficial da empresa.</Text>
            <Text style={s.topicoBullet}>• Nenhuma instituição séria pede senha ou código por telefone.</Text>
            <Text style={s.topicoBullet}>• Não instale aplicativos a pedido de quem ligou.</Text>
          </AccordionItem>

          <AccordionItem title="Redes sociais" subtitle="Perfis falsos e engenharia social."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Perfis falsos ou clonados que se passam por conhecidos e pedem dinheiro ou dados.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Confirme por outro canal, como uma ligação, antes de ajudar.</Text>
            <Text style={s.topicoBullet}>• Desconfie de pedidos urgentes de dinheiro, mesmo de contatos conhecidos.</Text>
            <Text style={s.topicoBullet}>• Ative a verificação em duas etapas nas suas contas.</Text>
          </AccordionItem>

          <AccordionItem title="Outros golpes" subtitle="Conheça mais e se proteja."
            icon={<ShieldIcon size={28} color={C.blue}/>}>
            <Text style={s.topicoPar}>Existem muitas variações de golpe, mas quase todas usam pressa e pedem dados ou dinheiro.</Text>
            <Text style={s.topicoSub}>Como se proteger</Text>
            <Text style={s.topicoBullet}>• Pare e respire antes de agir.</Text>
            <Text style={s.topicoBullet}>• Converse com alguém de confiança antes de decidir.</Text>
            <Text style={s.topicoBullet}>• Bloqueie o contato e denuncie na plataforma.</Text>
          </AccordionItem>

          <TouchableOpacity style={s.verMaisBtn} onPress={() => navigation.navigate('Aprender')} activeOpacity={0.85}>
            <Text style={s.verMaisText}>Ver conteúdo completo →</Text>
          </TouchableOpacity>
        </View>

        {/* SIMULADOR */}
        <View style={[s.section, s.sectionAzulEscuro]}>
          <Text style={[s.eyebrow, { color: C.yellow }]}>Simulador</Text>
          <Text style={[s.sectionTitle, { color: C.white }]}>Simule, aprenda e tome melhores decisões</Text>
          <Text style={[s.heroLead, { color: 'rgba(255,255,255,0.8)', marginBottom: 16 }]}>
            Treine com situações reais, sem risco. Escolha uma resposta e veja na hora o que aconteceria.
          </Text>
          <MiniQuiz />
          <TouchableOpacity style={s.btnAmarelo} onPress={() => navigation.navigate('TesteMensagem')} activeOpacity={0.85}>
            <Text style={s.btnAmareloText}>Começar a treinar</Text>
          </TouchableOpacity>
        </View>

        {/* BANNER FINAL */}
        <View style={[s.section, { alignItems: 'center', paddingBottom: 40 }]}>
          <Image source={require('../../assets/images/duplamascotes.png')}
            style={s.bannerMascote} resizeMode="contain"
            defaultSource={require('../../assets/images/fundo.png')} />
          <Text style={[s.sectionTitle, { textAlign: 'center', marginTop: 8 }]}>Juntos contra golpes!</Text>
          <Text style={[s.passoDesc, { textAlign: 'center' }]}>Aprenda, analise e se proteja.</Text>
        </View>

        {/* Rodapé */}
        <View style={s.footer}>
          <Text style={s.footerText}>Um projeto SheTech em parceria com o Banco do Brasil.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.white },
  scroll: { flex: 1, marginBottom: 62 },

  // Bottom Nav
  bottomNav: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', backgroundColor: C.white,
    borderTopWidth: 1, borderTopColor: C.border,
    paddingBottom: Platform.OS === 'android' ? 8 : 20,
    paddingTop: 8, zIndex: 100,
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 8,
  },
  navItem: { flex: 1, alignItems: 'center', gap: 2 },
  navLabel: { fontSize: 10, color: '#8A94A6', marginTop: 2 },
  navLabelActive: { fontSize: 10, color: C.navy, fontWeight: '700', marginTop: 2 },

  // Hero
  hero: { backgroundColor: C.blue, paddingTop: SB_H + 16, paddingHorizontal: 20, paddingBottom: 0 },
  heroBg: { ...StyleSheet.absoluteFillObject, backgroundColor: C.blue },
  heroContent: { marginBottom: 16 },
  pill: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: 'flex-start', marginBottom: 12 },
  pillText: { color: C.white, fontSize: 12, marginLeft: 6, fontWeight: '600' },
  heroTitle: { fontSize: 30, fontWeight: '900', color: C.white, lineHeight: 36, marginBottom: 10 },
  heroDestaque: { color: C.yellow },
  heroLead: { fontSize: 14, color: 'rgba(255,255,255,0.85)', lineHeight: 20, marginBottom: 16 },
  btnOutline: { borderWidth: 2, borderColor: C.white, borderRadius: 10, paddingVertical: 12,
    paddingHorizontal: 20, alignSelf: 'flex-start' },
  btnOutlineText: { color: C.white, fontWeight: '700', fontSize: 14 },
  heroImg: { width: width - 40, height: 180, alignSelf: 'center' },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 28, backgroundColor: C.white },
  sectionAlt: { backgroundColor: C.gray },
  sectionAzulClaro: { backgroundColor: '#eef4ff' },
  sectionAzulEscuro: { backgroundColor: C.navy },
  eyebrow: { fontSize: 11, fontWeight: '700', color: C.blue, letterSpacing: 1.5,
    textTransform: 'uppercase', marginBottom: 4 },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: C.navy, marginBottom: 16, lineHeight: 28 },

  // Acessos
  acessos: { gap: 12 },
  acessoAzul: { backgroundColor: C.blue, borderRadius: 16, padding: 20 },
  acessoAmarelo: { backgroundColor: '#fffde7', borderRadius: 16, padding: 20,
    borderWidth: 1, borderColor: '#ffe57f' },
  acessoIconWrap: { width: 48, height: 48, backgroundColor: C.white, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  acessoIconWrapDark: { width: 48, height: 48, backgroundColor: C.navy, borderRadius: 24,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  acessoTitulo: { fontSize: 20, fontWeight: '800', color: C.white, marginBottom: 4 },
  acessoTituloNavy: { fontSize: 20, fontWeight: '800', color: C.navy, marginBottom: 4 },
  acessoDesc: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginBottom: 16 },
  acessoDescNavy: { fontSize: 14, color: C.muted, marginBottom: 16 },
  btnBrancoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.white,
    alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnBrancoText: { color: C.blue, fontWeight: '700', fontSize: 14 },
  arrowBlue: { color: C.blue, fontSize: 16, fontWeight: '700' },
  btnEscuroRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: C.navy,
    alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8 },
  btnEscuroText: { color: C.white, fontWeight: '700', fontSize: 14 },
  arrowYellow: { color: C.yellow, fontSize: 16, fontWeight: '700' },

  // Passos
  passos: { gap: 16 },
  passo: { backgroundColor: C.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: C.border },
  passoNumCircle: { width: 36, height: 36, borderRadius: 18, backgroundColor: C.blue,
    justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  passoNum: { color: C.white, fontWeight: '800', fontSize: 16 },
  passoTitulo: { fontSize: 16, fontWeight: '700', color: C.navy, marginBottom: 4 },
  passoDesc: { fontSize: 13, color: C.muted, lineHeight: 19 },

  // Accordion
  accordion: { backgroundColor: C.white, borderRadius: 12, marginBottom: 8,
    borderWidth: 1, borderColor: C.border, overflow: 'hidden' },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  accordionIcon: { marginRight: 12 },
  accordionText: { flex: 1 },
  accordionTitle: { fontSize: 15, fontWeight: '700', color: C.navy },
  accordionSub: { fontSize: 12, color: C.muted, marginTop: 1 },
  accordionArrow: { fontSize: 22, color: C.blue, fontWeight: '300', transform: [{ rotate: '0deg' }] },
  accordionArrowOpen: { transform: [{ rotate: '90deg' }] },
  accordionBody: { paddingHorizontal: 14, paddingBottom: 14, paddingTop: 0 },
  topicoPar: { fontSize: 13, color: C.text, lineHeight: 19, marginBottom: 8 },
  topicoSub: { fontSize: 12, fontWeight: '700', color: C.navy, marginBottom: 4 },
  topicoBullet: { fontSize: 13, color: C.muted, lineHeight: 19, marginBottom: 2 },
  verMaisBtn: { marginTop: 12, alignSelf: 'center' },
  verMaisText: { color: C.blue, fontWeight: '700', fontSize: 14 },

  // Quiz
  quizBox: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16 },
  quizEtapa: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginBottom: 8, fontWeight: '600' },
  quizPergunta: { fontSize: 15, color: C.white, fontWeight: '700', marginBottom: 12, lineHeight: 22 },
  quizOpcao: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  quizCorreta: { backgroundColor: 'rgba(34,197,94,0.2)', borderColor: '#22c55e' },
  quizErrada: { backgroundColor: 'rgba(239,68,68,0.2)', borderColor: '#ef4444' },
  quizLetraBox: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  quizLetra: { color: C.white, fontWeight: '700', fontSize: 13 },
  quizTexto: { flex: 1, color: C.white, fontSize: 13, lineHeight: 18 },
  quizFeedback: { borderRadius: 10, padding: 12, marginTop: 8 },
  quizFeedbackOk: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1, borderColor: '#22c55e' },
  quizFeedbackBad: { backgroundColor: 'rgba(239,68,68,0.15)', borderWidth: 1, borderColor: '#ef4444' },
  quizFeedbackTitulo: { color: C.white, fontWeight: '700', fontSize: 13, marginBottom: 4 },
  quizFeedbackTexto: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 18 },

  // Botões
  btnAmarelo: { backgroundColor: C.yellow, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 16 },
  btnAmareloText: { color: C.navy, fontWeight: '800', fontSize: 15 },

  // Banner
  bannerMascote: { width: width * 0.7, height: 160 },

  // Footer
  footer: { paddingVertical: 20, paddingHorizontal: 20, backgroundColor: C.gray, borderTopWidth: 1, borderTopColor: C.border },
  footerText: { fontSize: 12, color: C.muted, textAlign: 'center' },
});
