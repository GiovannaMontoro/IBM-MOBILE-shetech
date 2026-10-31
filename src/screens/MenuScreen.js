import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FFFFFF',
  navy:        '#1B3A6B',
  blue:        '#1F5FD0',
  yellow:      '#F5C518',
  yellowLight: '#FFF3B0',
  gray:        '#F4F6FB',
  grayBorder:  '#E8ECF4',
  textMed:     '#4A5568',
  navInactive: '#8A94A6',
};

// ─── Ícones SVG ───────────────────────────────────────────────────────────────
function HouseIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 4l9 8" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BookOpenIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Path d="M2 6s1.5-2 5-2 5 2 5 2v13s-1.5-1-5-1-5 1-5 1V6z" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 6s1.5-2 5-2 5 2 5 2v13s-1.5-1-5-1-5 1-5 1V6z" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function PersonIcon() {
  return (
    <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={C.navy} strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function HomeIconNav({ active }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M3 12L12 4l9 8" stroke={active ? C.navy : C.navInactive} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 10v9a1 1 0 001 1h4v-4h4v4h4a1 1 0 001-1v-9" stroke={active ? C.navy : C.navInactive} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BookIconNav({ active }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M2 6s1.5-2 5-2 5 2 5 2v13s-1.5-1-5-1-5 1-5 1V6z" stroke={active ? C.navy : C.navInactive} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 6s1.5-2 5-2 5 2 5 2v13s-1.5-1-5-1-5 1-5 1V6z" stroke={active ? C.navy : C.navInactive} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProfileIconNav({ active }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={active ? C.navy : C.navInactive} strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={active ? C.navy : C.navInactive} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

const SB_H  = Platform.OS === 'android' ? 28 : 44;
const NAV_H = Platform.OS === 'android' ? 60 : 80;

const MENU_ITEMS = [
  { label: 'Início',    sub: 'Acesse suas ferramentas\nde proteção e simulações.', Icon: HouseIcon,   screen: 'Home'    },
  { label: 'Aprender', sub: 'Dicas e informações sobre\ngolpes e segurança.',      Icon: BookOpenIcon,screen: 'Learn'   },
  { label: 'Perfil',   sub: 'Seus dados e configurações.',                          Icon: PersonIcon,  screen: 'Profile' },
];

// Navega para uma tab dentro do MainTabs
function goToTab(navigation, tab) {
  navigation.navigate('Main', { screen: tab });
}

export default function MenuScreen({ navigation }) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <View style={s.content}>
        {/* Badge número 2 + título */}
        <View style={s.headerRow}>
          <View style={s.badge}><Text style={s.badgeNum}>2</Text></View>
          <Text style={s.headerTitle}>Menu</Text>
        </View>

        {/* Logo Guardião */}
        <View style={s.logoBlock}>
          <Text style={s.logoText}>Guardião</Text>
          {/* tracinhos decorativos amarelos */}
          <Svg width={60} height={50} style={s.sparkle} pointerEvents="none">
            <Rect x={12} y={40} width={12} height={4} rx={6} fill={C.yellow} transform="rotate(-127, 24, 32)" />
            <Rect x={26} y={25} width={14} height={4} rx={6} fill={C.yellow} transform="rotate(-90, 38, 18)" />
            <Rect x={44} y={33} width={12} height={4} rx={6} fill={C.yellow} transform="rotate(-42, 42, 28)" />
          </Svg>
          <Text style={s.logoSub}>Seu aliado contra golpes.</Text>
        </View>

        {/* Itens do menu */}
        {MENU_ITEMS.map(({ label, sub, Icon, screen }) => (
          <TouchableOpacity
            key={label}
            style={s.menuCard}
            activeOpacity={0.8}
            onPress={() => goToTab(navigation, screen)}
          >
            <View style={s.iconCircle}>
              <Icon />
            </View>
            <View style={s.menuText}>
              <Text style={s.menuLabel}>{label}</Text>
              <Text style={s.menuSub}>{sub}</Text>
            </View>
            <ChevronRight />
          </TouchableOpacity>
        ))}
      </View>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <View style={s.navPill}>
          <TouchableOpacity style={s.navItem} onPress={() => goToTab(navigation, 'Home')}>
            <HomeIconNav active={false} />
            <Text style={s.navLabel}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => goToTab(navigation, 'Learn')}>
            <BookIconNav active={false} />
            <Text style={s.navLabel}>Aprender</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => goToTab(navigation, 'Profile')}>
            <ProfileIconNav active={true} />
            <Text style={s.navLabelActive}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: C.bg },
  content:     { flex: 1, paddingTop: SB_H + 12, paddingHorizontal: 20, paddingBottom: NAV_H },

  headerRow:   { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  badge:       { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navy, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeNum:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.navy },

  logoBlock:   { alignItems: 'center', marginBottom: 28 },
  logoText:    { fontSize: 38, fontWeight: '900', fontStyle: 'italic', color: C.navy, letterSpacing: -0.5 },
  sparkle:     { position: 'absolute', top: -10, right: '20%' },
  logoSub:     { fontSize: 14, color: C.textMed, marginTop: 2 },

  menuCard:    { flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray, borderRadius: 14, borderWidth: 1, borderColor: C.grayBorder, padding: 14, marginBottom: 12 },
  iconCircle:  { width: 54, height: 54, borderRadius: 27, backgroundColor: C.yellow, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  menuText:    { flex: 1 },
  menuLabel:   { fontSize: 17, fontWeight: '700', color: C.navy, marginBottom: 2 },
  menuSub:     { fontSize: 12, color: C.textMed, lineHeight: 17 },

  bottomNav:   { position: 'absolute', bottom: 0, left: 0, right: 0, height: NAV_H, paddingBottom: Platform.OS === 'ios' ? 18 : 4, paddingHorizontal: 16, justifyContent: 'flex-end' },
  navPill:     { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 24, borderWidth: 1, borderColor: C.grayBorder, paddingVertical: 8, paddingHorizontal: 8, justifyContent: 'space-around', elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  navItem:     { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navLabel:    { fontSize: 11, color: C.navInactive, marginTop: 2 },
  navLabelActive: { fontSize: 11, color: C.navy, fontWeight: '700', marginTop: 2 },
});
