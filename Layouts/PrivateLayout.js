import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import RodapeNavegacao from '../components/RodapeNavegacao';
import { useAuth } from '../context/AuthContext';
import { useRouter, Slot, usePathname } from 'expo-router';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function PrivateLayout() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  const pathname = usePathname();
  const esconderRodape = pathname.includes('/pegada') && usuario?.primeiroAcesso;

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady || !usuario) return;

    if (!usuario) {
      router.replace('/(public)/login');
      return;
    }

    const rota = pathname.toLowerCase();

    if (
      rota.includes('catalogorecompensapj') ||
      rota.includes('validarvoucherpj') ||
      rota.includes('faleconosco')
    ) {
      if (usuario.tipo !== 'pj') {
        router.replace('/(private)/home');
      }
    }
    if (
      rota.includes('pegada') ||
      rota.includes('historicopontos') ||
      rota.includes('catalogovoucherspf') ||
      rota.includes('historicopegada')
    ) {
      if (usuario.tipo !== 'pf') {
        router.replace('/(private)/home');
      }
    }
  }, [isReady, usuario, pathname]);

  if (!usuario) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.fundo} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.conteudoWrapper}>
          <ScrollView
            contentContainerStyle={styles.conteudo}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Slot />
          </ScrollView>
        </View>
        {!esconderRodape && (
          <View style={styles.rodape}>
            <RodapeNavegacao ativo="menu" />
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.fundo,
  },
  container: {
    flex: 1,
    backgroundColor: colors.fundo,
    paddingTop: spacing.lg,
  },
  conteudoWrapper: {
    flex: 1,
  },
  conteudo: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 48,
  },
});
