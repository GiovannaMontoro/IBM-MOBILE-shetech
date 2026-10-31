import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

const C = {
  bg:          '#FFFFFF',
  navy:        '#1B3A6B',
  yellow:      '#F5C518',
  gray:        '#F4F6FB',
  grayBorder:  '#E8ECF4',
  textMed:     '#4A5568',
  navInactive: '#8A94A6',
};

const SB_H  = Platform.OS === 'android' ? 28 : 44;
const NAV_H = Platform.OS === 'android' ? 60 : 80;

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

export default function LearnScreen({ navigation }) {
  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <Text style={s.title}>Aprender</Text>
        <Text style={s.subtitle}>Em breve...</Text>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={s.bottomNav}>
        <View style={s.navPill}>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <HomeIconNav active={false} />
            <Text style={s.navLabel}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem}>
            <BookIconNav active={true} />
            <Text style={s.navLabelActive}>Aprender</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Main', { screen: 'Profile' })}>
            <ProfileIconNav active={false} />
            <Text style={s.navLabel}>Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingTop: SB_H + 24, paddingHorizontal: 24, paddingBottom: NAV_H + 16, flexGrow: 1 },

  title:    { fontSize: 28, fontWeight: '700', color: C.navy, marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.textMed },

  bottomNav:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: NAV_H, paddingBottom: Platform.OS === 'ios' ? 18 : 4, paddingHorizontal: 16, justifyContent: 'flex-end' },
  navPill:        { flexDirection: 'row', backgroundColor: C.bg, borderRadius: 24, borderWidth: 1, borderColor: C.grayBorder, paddingVertical: 8, paddingHorizontal: 8, justifyContent: 'space-around', elevation: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } },
  navItem:        { flex: 1, alignItems: 'center', paddingVertical: 2 },
  navLabel:       { fontSize: 11, color: C.navInactive, marginTop: 2 },
  navLabelActive: { fontSize: 11, color: C.navy, fontWeight: '700', marginTop: 2 },
});
