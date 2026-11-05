import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  ImageBackground,
  Dimensions,
  Platform,
} from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient as SvgLinear, Stop, Text as SvgText, TextPath } from 'react-native-svg';
import {
  useFonts,
  Nunito_800ExtraBold_Italic,
  Nunito_700Bold,
  Nunito_600SemiBold,
  Nunito_400Regular,
} from '@expo-google-fonts/nunito';

const { width, height } = Dimensions.get('window');

// ─── Paleta extraída pixel a pixel do protótipo B ────────────────────────────
const C = {
  bgTop:        '#C8E8F8',
  bgBot:        '#BDE0F6',
  titleBlue:    '#1A5DC8',
  navyDark:     '#1B3A6B',
  cardBlue:     '#1F5FD0',
  cardYellowBg: '#FFF1A8',
  yellow:       '#F5C518',
  yellowDeco:   '#F5C518',
  white:        '#FFFFFF',
  subtitleMed:  '#2563A8',
  navInactive:  '#8A94A6',
};

// ─── Fundo: degradê + formas decorativas SVG ─────────────────────────────────
function BackgroundSVG() {
  const W = width;
  const H = height;
  return (
    <Svg width={W} height={H} style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <SvgLinear id="bgGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0"   stopColor={C.bgTop} />
          <Stop offset="1"   stopColor={C.bgBot} />
        </SvgLinear>
      </Defs>

      {/* Fundo degradê */}
      <Rect x={0} y={0} width={W} height={H} fill="url(#bgGrad)" />

      {/* ── Blob amarelo canto sup-esq ── */}
      <Path
        d={`M0,0 L${W*0.52},0 Q${W*0.38},${H*0.005} ${W*0.28},${H*0.055}
            Q${W*0.12},${H*0.1} 0,${H*0.09} Z`}
        fill={C.yellow}
      />

      {/* ── Blob azul-claro sup-esq (folha) ── */}
      <Path
        d={`M0,${H*0.22} Q${W*0.04},${H*0.17} ${W*0.14},${H*0.22}
            Q${W*0.16},${H*0.3} ${W*0.1},${H*0.34}
            Q${W*0.02},${H*0.36} 0,${H*0.3} Z`}
        fill="#9DD4EE" opacity={0.7}
      />
      {/* folha menor atrás */}
      <Path
        d={`M0,${H*0.26} Q${W*0.06},${H*0.22} ${W*0.11},${H*0.26}
            Q${W*0.12},${H*0.32} ${W*0.06},${H*0.35}
            Q${W*0.01},${H*0.35} 0,${H*0.32} Z`}
        fill="#B8DFF0" opacity={0.6}
      />

      {/* ── Círculo médio direita ── */}
      <Circle cx={W*0.91} cy={H*0.32} r={W*0.11} fill="#9DD4EE" opacity={0.55} />
      {/* ── Círculo pequeno esq ── */}
      <Circle cx={W*0.09} cy={H*0.2}  r={W*0.04} fill="#9DD4EE" opacity={0.65} />
      {/* ── Círculo minúsculo direita-meio ── */}
      <Circle cx={W*0.93} cy={H*0.5}  r={W*0.028} fill="#9DD4EE" opacity={0.5} />

      {/* ── Traços amarelos decorativos esq (zona mascotes) ── */}
      <Rect x={W*0.03} y={H*0.26} width={W*0.048} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(-40,${W*0.03},${H*0.26})`} />
      <Rect x={W*0.01} y={H*0.31} width={W*0.042} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(-60,${W*0.01},${H*0.31})`} />
      <Rect x={W*0.05} y={H*0.36} width={W*0.044} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(-25,${W*0.05},${H*0.36})`} />
      <Rect x={W*0.02} y={H*0.41} width={W*0.038} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(-50,${W*0.02},${H*0.41})`} />

      {/* ── Traços amarelos decorativos dir ── */}
      <Rect x={W*0.88} y={H*0.26} width={W*0.042} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(35,${W*0.88},${H*0.26})`} />
      <Rect x={W*0.91} y={H*0.31} width={W*0.036} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(55,${W*0.91},${H*0.31})`} />
      <Rect x={W*0.86} y={H*0.37} width={W*0.04}  height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(20,${W*0.86},${H*0.37})`} />
      <Rect x={W*0.92} y={H*0.42} width={W*0.034} height={5} rx={2.5}
        fill={C.yellow} transform={`rotate(45,${W*0.92},${H*0.42})`} />

      {/* ── Onda amarela inferior (frente) ── */}
      <Path
        d={`M0,${H*0.78}
            C${W*0.12},${H*0.73} ${W*0.28},${H*0.75} ${W*0.45},${H*0.77}
            C${W*0.62},${H*0.79} ${W*0.78},${H*0.74} ${W},${H*0.76}
            L${W},${H} L0,${H} Z`}
        fill={C.yellow}
      />
      {/* ── Onda amarela inferior (atrás — mais clara) ── */}
      <Path
        d={`M0,${H*0.84}
            C${W*0.18},${H*0.79} ${W*0.35},${H*0.82} ${W*0.55},${H*0.8}
            C${W*0.72},${H*0.78} ${W*0.88},${H*0.83} ${W},${H*0.81}
            L${W},${H} L0,${H} Z`}
        fill="#F9D94E" opacity={0.55}
      />
      {/* ── Onda azul no rodapé (atrás do nav) ── */}
      <Path
        d={`M0,${H*0.91}
            C${W*0.22},${H*0.87} ${W*0.5},${H*0.9} ${W*0.7},${H*0.88}
            C${W*0.85},${H*0.87} ${W*0.94},${H*0.9} ${W},${H*0.88}
            L${W},${H} L0,${H} Z`}
        fill={C.cardBlue} opacity={0.55}
      />
    </Svg>
  );
}

// ─── Ícone escudo com check ───────────────────────────────────────────────────
function ShieldCheckIcon({ size = 26, color = C.cardBlue }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 2L20 5.5V11C20 15.42 16.5 19.5 12 21C7.5 19.5 4 15.42 4 11V5.5L12 2Z"
        fill={color} stroke={color} strokeWidth={0.5}
      />
      <Path
        d="M9 12L11 14L15 10"
        fill="none" stroke={C.white} strokeWidth={2}
        strokeLinecap="round" strokeLinejoin="round"
      />
    </Svg>
  );
}

// ─── Ícone barras ─────────────────────────────────────────────────────────────
function BarChartIcon({ size = 26 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x="4"  y="12" width="4" height="8"  rx="1" fill={C.white} />
      <Rect x="10" y="8"  width="4" height="12" rx="1" fill={C.white} />
      <Rect x="16" y="4"  width="4" height="16" rx="1" fill={C.white} />
    </Svg>
  );
}

// ─── Nav icons ────────────────────────────────────────────────────────────────
function HomeIcon({ active }) {
  const c = active ? C.navyDark : C.navInactive;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path d="M3 12L12 4L21 12V20C21 20.55 20.55 21 20 21H15V16H9V21H4C3.45 21 3 20.55 3 20V12Z"
        fill={active ? C.navyDark : 'none'} stroke={c} strokeWidth={1.7}
        strokeLinejoin="round" strokeLinecap="round" />
    </Svg>
  );
}
function BookIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Path d="M4 19.5A2.5 2.5 0 016.5 17H20" fill="none" stroke={C.navInactive} strokeWidth={1.7} strokeLinecap="round"/>
      <Path d="M6.5 2H20V22H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2Z"
        fill="none" stroke={C.navInactive} strokeWidth={1.7} strokeLinejoin="round"/>
    </Svg>
  );
}
function ProfileIcon() {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24">
      <Circle cx="12" cy="8" r="4" fill="none" stroke={C.navInactive} strokeWidth={1.7} />
      <Path d="M4 20C4 16.69 7.58 14 12 14C16.42 14 20 16.69 20 20"
        fill="none" stroke={C.navInactive} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

// ─── Tela ─────────────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }) {
  const [fontsLoaded] = useFonts({
    Nunito_800ExtraBold_Italic,
    Nunito_700Bold,
    Nunito_600SemiBold,
    Nunito_400Regular,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: C.bgTop }} />;
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* Fundo real — imagem png */}
      <Image
        source={require('../../assets/images/fundo.png')}
        style={{ position: 'absolute', top: 0, left: 0, width, height: height + 60 }}
        resizeMode="stretch"
      />

      {/* Decorações SVG */}
      <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }} pointerEvents="none">
        <Circle cx={width * 0.05} cy={height * 0.20} r={width * 0.02} fill="#3aaff3" opacity={0.45} />
        <Circle cx={width * 0.09} cy={height * 0.52} r={width * 0.035} fill="#5eb4ee" opacity={0.4} />
        <Path
          d={`M${width*-0.12},${height*0.32}
              C${width*0.01},${height*0.27} ${width*0.01},${height*0.28} ${width*0.11},${height*0.33}
              C${width*0.14},${height*0.4} ${width*0.08},${height*0.46} ${width*0.01},${height*0.47}
              C${width*-0.05},${height*0.48} ${width*-0.06},${height*0.38} ${width*-0.04},${height*0.32} Z`}
          fill="#5bbae9" opacity={0.4}
          transform={`rotate(-0.20, ${width*0.06}, ${height*0.35})`}
        />
      </Svg>

      {/* Conteúdo */}
      <View style={s.safeWrap}>

        {/* Título + slogan */}
        <View style={s.titleBlock}>
          <View style={{ position: 'relative' }}>
            <Text style={s.title}>Guardião</Text>
            <Svg width={80} height={70} style={{ position: 'absolute', top: -30, right: -10 }} pointerEvents="none">
              <Rect x={22} y={54} width={16} height={5} rx={8} fill={C.yellow} transform="rotate(-127, 35, 41)" />
              <Rect x={35} y={37} width={19} height={5} rx={8} fill={C.yellow} transform="rotate(-90, 49, 27)" />
              <Rect x={60} y={46} width={16} height={5} rx={8} fill={C.yellow} transform="rotate(-42, 56, 39)" />
            </Svg>
          </View>
          <Text style={s.slogan}>Sua aliada contra golpes.</Text>
        </View>

        {/* Mascotes */}
        <View style={s.mascotBlock}>
          <Image
            source={require('../../assets/images/mascotes.png')}
            style={s.mascotImg}
            resizeMode="contain"
          />
        </View>

        {/* Cards */}
        <View style={s.cardsBlock}>

          {/* Card 1 — Guardião */}
          <TouchableOpacity style={s.cardBlue} activeOpacity={0.85}
            onPress={() => navigation.navigate('InicioOpcao')}>
            <View style={s.iconCircleWhite}>
              <ShieldCheckIcon size={26} color={C.cardBlue} />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitleWhite}>Guardião</Text>
              <Text style={s.cardSubWhite}>Monitore e proteja-se.</Text>
            </View>
            <Text style={s.arrowWhite}>›</Text>
          </TouchableOpacity>

          {/* Card 2 — BB Decision */}
          <TouchableOpacity style={s.cardYellow} activeOpacity={0.85}
            onPress={() => navigation.navigate('InicioOpcao')}>
            <View style={s.iconCircleNavy}>
              <BarChartIcon size={26} />
            </View>
            <View style={s.cardText}>
              <Text style={s.cardTitleNavy}>BB Decision</Text>
              <Text style={s.cardSubMed}>Aprenda e simule.</Text>
            </View>
            <Text style={s.arrowNavy}>›</Text>
          </TouchableOpacity>

        </View>
      </View>

      {/* Barra de navegação */}
      <View style={s.bottomNav}>
        <View style={s.navPill}>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('InicioOpcao')}>
            <HomeIcon active={true} />
            <Text style={s.navLabelActive}>Início</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Login')}>
            <BookIcon />
            <Text style={s.navLabel}>Login</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.navItem} onPress={() => navigation.navigate('Cadastro')}>
            <ProfileIcon />
            <Text style={s.navLabel}>Cadastro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const SB_H   = Platform.OS === 'android' ? 28 : 44;
const NAV_H  = Platform.OS === 'android' ? 56 : 78;

const s = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#1B4FA0',
  },

  safeWrap: {
    flex: 1,
    paddingTop: SB_H,
    paddingBottom: 0,
  },

  titleBlock: {
    alignItems: 'center',
    marginTop: Math.round(height * 0.09),
    paddingHorizontal: 16,
  },
  title: {
    fontFamily: 'Nunito_800ExtraBold_Italic',
    fontSize: Math.round(width * 0.125),
    color: '#184c77',
    letterSpacing: -0.5,
    textShadowColor: 'rgba(255,255,255,0.8)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    lineHeight: Math.round(width * 0.14),
  },
  slogan: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: Math.round(width * 0.038),
    color: C.navyDark,
    marginTop: -2,
    textAlign: 'center',
  },

  mascotBlock: {
    alignItems: 'center',
    marginBottom: -Math.round(width * 0.13),
    marginTop: Math.round(height * 0.05),
    marginRight: Math.round(width * 0.05),
    zIndex: 1,
  },
  mascotImg: {
    width:  width * 0.88,
    height: width * 0.82,
  },

  cardsBlock: {
    paddingHorizontal: 16,
    gap: 10,
    zIndex: 2,
  },

  cardBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardBlue,
    borderRadius: 22,
    paddingVertical: Math.round(width * 0.052),
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },

  cardYellow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cardYellowBg,
    borderRadius: 22,
    paddingVertical: Math.round(width * 0.052),
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: C.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },

  iconCircleWhite: {
    width:  Math.round(width * 0.122),
    height: Math.round(width * 0.122),
    borderRadius: Math.round(width * 0.061),
    backgroundColor: C.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  iconCircleNavy: {
    width:  Math.round(width * 0.122),
    height: Math.round(width * 0.122),
    borderRadius: Math.round(width * 0.061),
    backgroundColor: C.cardBlue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },

  cardText: { flex: 1 },

  cardTitleWhite: {
    fontFamily: 'Nunito_700Bold',
    fontSize: Math.round(width * 0.048),
    color: C.white,
  },
  cardSubWhite: {
    fontFamily: 'Nunito_400Regular',
    fontSize: Math.round(width * 0.034),
    color: 'rgba(255,255,255,0.85)',
    marginTop: 1,
  },
  cardTitleNavy: {
    fontFamily: 'Nunito_700Bold',
    fontSize: Math.round(width * 0.048),
    color: C.navyDark,
  },
  cardSubMed: {
    fontFamily: 'Nunito_400Regular',
    fontSize: Math.round(width * 0.034),
    color: C.subtitleMed,
    marginTop: 1,
  },

  arrowWhite: {
    fontSize: 30,
    color: C.white,
    fontWeight: '200',
    lineHeight: 34,
    marginLeft: 4,
  },
  arrowNavy: {
    fontSize: 30,
    color: C.navyDark,
    fontWeight: '200',
    lineHeight: 34,
    marginLeft: 4,
  },

  bottomNav: {
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'android' ? 10 : 24,
    paddingTop: 6,
    zIndex: 10,
  },
  navPill: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  navLabel: {
    fontFamily: 'Nunito_400Regular',
    fontSize: 11,
    color: C.navInactive,
  },
  navLabelActive: {
    fontFamily: 'Nunito_700Bold',
    fontSize: 11,
    color: C.navyDark,
  },
});
