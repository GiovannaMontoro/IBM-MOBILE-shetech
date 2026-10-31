import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen    from '../screens/HomeScreen';
import LearnScreen   from '../screens/LearnScreen';
import ProfileScreen from '../screens/ProfileScreen';
import MenuScreen    from '../screens/MenuScreen';
import LoginScreen   from '../screens/LoginScreen';
import CadastroScreen from '../screens/CadastroScreen';

const Stack = createNativeStackNavigator();
const Tab   = createBottomTabNavigator();

// Tab navigator (tela interna do app — Início, Aprender, Perfil)
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' }, // Nav customizada dentro de cada tela
      }}
    >
      <Tab.Screen name="Home"    component={HomeScreen}    />
      <Tab.Screen name="Learn"   component={LearnScreen}   />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

// Stack raiz — inclui o fluxo de autenticação + telas de menu
export default function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      initialRouteName="Main"
    >
      {/* Telas do app principal */}
      <Stack.Screen name="Main"     component={MainTabs}      />
      <Stack.Screen name="Menu"     component={MenuScreen}    />

      {/* Fluxo de autenticação */}
      <Stack.Screen name="Login"    component={LoginScreen}   />
      <Stack.Screen name="Cadastro" component={CadastroScreen} />
    </Stack.Navigator>
  );
}
