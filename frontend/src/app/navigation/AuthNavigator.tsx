/**
 * frontend/src/app/navigation/AuthNavigator.tsx
 * Full pre-login stack: Splash → RoleSelect → Login / Register / CheckEmail
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../../(auth)/SplashScreen';
import { RoleSelectScreen } from '../../(auth)/RoleSelectScreen';
import { LoginScreen } from '../../(auth)/LoginScreen';
import { RegisterScreen } from '../../(auth)/RegisterScreen';
import { CheckEmailScreen } from '../../(auth)/CheckEmailScreen';

export type AuthStackParamList = {
  Splash: undefined;
  RoleSelect: undefined;
  Login: undefined;
  Register: undefined;
  CheckEmail: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="RoleSelect" component={RoleSelectScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="CheckEmail" component={CheckEmailScreen} />
    </Stack.Navigator>
  );
}
