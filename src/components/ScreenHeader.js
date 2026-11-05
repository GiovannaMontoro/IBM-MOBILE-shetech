import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, StatusBar } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const SB_H = Platform.OS === 'android' ? 28 : 44;

export function ScreenHeader({ title, subtitle, onBack, light = false }) {
  return (
    <View style={[s.header, light && s.headerLight]}>
      {onBack && (
        <TouchableOpacity style={s.backBtn} onPress={onBack} activeOpacity={0.7}>
          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
            <Path d="M19 12H5M5 12l7 7M5 12l7-7"
              stroke={light ? '#002a63' : '#fff'} strokeWidth={2.2}
              strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </TouchableOpacity>
      )}
      <View style={s.texts}>
        <Text style={[s.title, light && s.titleLight]}>{title}</Text>
        {subtitle ? <Text style={[s.sub, light && s.subLight]}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    paddingTop: SB_H + 8,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: '#1F5FD0',
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLight: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8ECF4' },
  backBtn: { marginRight: 12, padding: 4 },
  texts: { flex: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#fff' },
  titleLight: { color: '#1B3A6B' },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  subLight: { color: '#4A5568' },
});
