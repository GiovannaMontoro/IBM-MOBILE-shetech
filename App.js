import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { getSavedToken } from './src/services/storage';
import { setAuthToken } from './src/services/api';

export default function App() {
  // Restaura sessão JWT ao reabrir o app
  useEffect(() => {
    getSavedToken().then(token => {
      if (token) setAuthToken(token);
    });
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
