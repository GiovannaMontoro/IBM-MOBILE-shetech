import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ── Telas existentes atualizadas ──────────────────────────────────────────────
import HomeScreen             from '../screens/HomeScreen';
import LoginScreen            from '../screens/LoginScreen';
import CadastroScreen         from '../screens/CadastroScreen';

// ── Novas telas completas ─────────────────────────────────────────────────────
import InicioOpcaoScreen          from '../screens/InicioOpcaoScreen';
import MenuScreen                 from '../screens/MenuScreen';
import MonitoramentoGuardiaoScreen from '../screens/MonitoramentoGuardiaoScreen';
import GuardiaoScreen             from '../screens/GuardiaoScreen';
import ApresentacaoDecisionScreen from '../screens/ApresentacaoDecisionScreen';
import BBDecisionScreen           from '../screens/BBDecisionScreen';
import AprenderScreen             from '../screens/AprenderScreen';
import TesteMensagemScreen        from '../screens/TesteMensagemScreen';
import TesteLinkScreen            from '../screens/TesteLinkScreen';
import TesteTransacoesScreen      from '../screens/TesteTransacoesScreen';
import TesteAplicativosScreen     from '../screens/TesteAplicativosScreen';
import ProfileScreen              from '../screens/ProfileScreen';
import HistoricoScreen            from '../screens/HistoricoScreen';
import ChatbotScreen              from '../screens/ChatbotScreen';

const Stack = createNativeStackNavigator();

/**
 * Navegador raiz — Stack puro com headerShown: false.
 * Todas as telas são acessíveis diretamente por nome.
 * Fluxo padrão: Home (página inicial animada) → InicioOpcao (página principal)
 */
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="Home"
    >
      {/* ── Tela inicial animada (splash/landing) ── */}
      <Stack.Screen name="Home"     component={HomeScreen} />

      {/* ── Autenticação ── */}
      <Stack.Screen name="Login"    component={LoginScreen} />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />

      {/* ── Página principal pós-login ── */}
      <Stack.Screen name="InicioOpcao" component={InicioOpcaoScreen} />
      <Stack.Screen name="Menu"        component={MenuScreen} />
      <Stack.Screen name="Profile"     component={ProfileScreen} />
      <Stack.Screen name="Historico"   component={HistoricoScreen} />
      <Stack.Screen name="Chatbot"     component={ChatbotScreen} />

      {/* ── Guardião ── */}
      <Stack.Screen name="MonitoramentoGuardiao" component={MonitoramentoGuardiaoScreen} />
      <Stack.Screen name="Guardiao"              component={GuardiaoScreen} />

      {/* ── BB Decision ── */}
      <Stack.Screen name="ApresentacaoDecision" component={ApresentacaoDecisionScreen} />
      <Stack.Screen name="BBDecision"           component={BBDecisionScreen} />

      {/* ── Educação ── */}
      <Stack.Screen name="Aprender"         component={AprenderScreen} />
      <Stack.Screen name="TesteMensagem"    component={TesteMensagemScreen} />
      <Stack.Screen name="TesteLink"        component={TesteLinkScreen} />
      <Stack.Screen name="TesteTransacoes"  component={TesteTransacoesScreen} />
      <Stack.Screen name="TesteAplicativos" component={TesteAplicativosScreen} />
    </Stack.Navigator>
  );
}
