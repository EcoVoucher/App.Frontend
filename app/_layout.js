import 'react-native-reanimated'; // PRIMEIRA LINHA

import React from 'react';
import { Stack } from 'expo-router';
import { AuthProvider } from '../context/AuthContext';
import { CarrinhoProvider } from '../context/CarrinhoContext';
import { ModalCarrinhoProvider } from '../context/ModalCarrinhoContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <CarrinhoProvider>
        <ModalCarrinhoProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade',
            }}
          />
        </ModalCarrinhoProvider>
      </CarrinhoProvider>
    </AuthProvider>
  );
}
