import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  Switch,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';

// ─── Paleta ──────────────────────────────────────────────────────────────────
const C = {
  bg:          '#FFFFFF',
  navy:        '#1B3A6B',
  blue:        '#1F5FD0',
  yellow:      '#F5C518',
  gray:        '#F4F6FB',
  grayBorder:  '#E8ECF4',
  textMed:     '#4A5568',
  navInactive: '#8A94A6',
  avatarBg:    '#1B3A6B',
};

const SB_H  = Platform.OS === 'android' ? 28 : 44;
const NAV_H = Platform.OS === 'android' ? 60 : 80;

// ─── Ícones ───────────────────────────────────────────────────────────────────
function ArrowLeft() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path d="M19 12H5M5 12l7 7M5 12l7-7" stroke={C.navy} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function GearIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={C.navy} strokeWidth={2} />
      <Path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke={C.navy} strokeWidth={2} />
    </Svg>
  );
}

function PersonOutlineIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={C.navy} strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ShieldIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BellIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={C.navy} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M13.73 21a2 2 0 01-3.46 0" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function GlobeIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={C.navy} strokeWidth={2} />
      <Path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" stroke={C.navy} strokeWidth={2} />
    </Svg>
  );
}

function QuestionIcon() {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={C.navy} strokeWidth={2} />
      <Path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke={C.navy} strokeWidth={2} strokeLinecap="round" />
      <Circle cx="12" cy="17" r="1" fill={C.navy} />
    </Svg>
  );
}

function AvatarIcon() {
  return (
    <Svg width={42} height={42} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke="#fff" strokeWidth={2} />
      <Path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
    </Svg>
  );
}

function ChevronRight() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M9 18l6-6-6-6" stroke={C.navInactive} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
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

const SETTINGS = [
  { label: 'Dados pessoais',  Icon: PersonOutlineIcon, type: 'arrow'  },
  { label: 'Segurança',       Icon: ShieldIcon,        type: 'arrow'  },
  { label: 'Notificações',    Icon: BellIcon,          type: 'toggle' },
  { label: 'Idioma',          Icon: GlobeIcon,         type: 'value',  value: 'Português' },
  { label: 'Ajuda',           Icon: QuestionIcon,      type: 'arrow'  },
];

export default function ProfileScreen({ navigation }) {
  const [notif, setNotif] = useState(true);

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={s.header}>
          <View style={s.badge}><Text style={s.badgeNum}>5</Text></View>
          <Text style={s.headerTitle}>Perfil</Text>
          <View style={{ flex: 1 }} />
          <TouchableOpacity style={s.gearBtn}>
            <GearIcon />
          </TouchableOpacity>
        </View>

        {/* Botão voltar */}
        <TouchableOpacity style={s.backRow} onPress={() => navigation.goBack()}>
          <ArrowLeft />
        </TouchableOpacity>

        {/* Card do usuário */}
        <View style={s.userCard}>
          <View style={s.avatar}><AvatarIcon /></View>
          <View style={s.userInfo}>
            <Text style={s.userName}>Maria Silva</Text>
            <Text style={s.userDetail}>maria@email.com</Text>
            <Text style={s.userDetail}>CPF: 123.456.789-00</Text>
          </View>
        </View>

        {/* Lista de configurações */}
        <View style={s.settingsList}>
          {SETTINGS.map(({ label, Icon, type, value }) => (
            <TouchableOpacity key={label} style={s.settingsRow} activeOpacity={type === 'toggle' ? 1 : 0.7}>
              <View style={s.settingsIcon}><Icon /></View>
              <Text style={s.settingsLabel}>{label}</Text>
              <View style={s.settingsRight}>
                {type === 'toggle' && (
                  <Switch
                    value={notif}
                    onValueChange={setNotif}
                    trackColor={{ false: C.grayBorder, true: C.yellow }}
                    thumbColor="#fff"
                  />
                )}
                {type === 'value' && (
                  <>
                    <Text style={s.settingsValue}>{value}</Text>
                    <ChevronRight />
                  </>
                )}
                {type === 'arrow' && <ChevronRight />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <View style={s.navPill}>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <HomeIconNav active={false} />
            <Text style={s.navLabel}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Main', { screen: 'Learn' })}>
            <BookIconNav active={false} />
            <Text style={s.navLabel}>Aprender</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem}>
            <ProfileIconNav active={true} />
            <Text style={s.navLabelActive}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: SB_H + 8, paddingHorizontal: 20, paddingBottom: NAV_H + 16 },

  header:      { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badge:       { width: 32, height: 32, borderRadius: 16, backgroundColor: C.navy, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  badgeNum:    { color: '#fff', fontWeight: '700', fontSize: 15 },
  headerTitle: { fontSize: 22, fontWeight: '700', color: C.navy },
  gearBtn:     { padding: 6 },

  backRow:  { marginBottom: 16, alignSelf: 'flex-start', padding: 6 },

  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 28 },
  avatar:   { width: 68, height: 68, borderRadius: 34, backgroundColor: C.avatarBg, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  userInfo: {},
  userName: { fontSize: 19, fontWeight: '800', color: C.navy, marginBottom: 2 },
  userDetail:{ fontSize: 13, color: C.textMed, lineHeight: 19 },

  settingsList: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: C.grayBorder },
  settingsRow:  { flexDirection: 'row', alignItems: 'center', backgroundColor: C.bg, paddingVertical: 16, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: C.grayBorder },
  settingsIcon: { width: 28, alignItems: 'center', marginRight: 14 },
  settingsLabel:{ flex: 1, fontSize: 15, color: C.navy, fontWeight: '500' },
  settingsRight:{ flexDirection: 'row', alignItems: 'center', gap: 6 },
  settingsValue:{ fontSize: 14, color: C.textMed, marginRight: 4 },

  bottomNav:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: NAV_H, paddingBottom: Platform.OS === 'ios' ? 18 : 4, paddingHorizontal: 16, justifyContent: 'flex-end' },
  navPill:        { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 24, borderWidth: 1, borderColor: C.grayBorder, paddingVertical: 8, paddingHorizontal: 8, justifyContent: 'space-around', elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  navItem:        { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navLabel:       { fontSize: 11, color: C.navInactive, marginTop: 2 },
  navLabelActive: { fontSize: 11, color: C.navy, fontWeight: '700', marginTop: 2 },
});
