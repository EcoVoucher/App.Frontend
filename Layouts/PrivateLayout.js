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
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  // Detecta se está na tela da pegada
const estaNaPegada = pathname.includes('/pegada');

// 🔥 Verifica se está exibindo o resultado da pegada no primeiro acesso
const exibindoResultado = estaNaPegada && usuario?.primeiroAcesso && pathname.includes('/home') === false;

  // 🔥 Esconder rodapé somente na tela Pegada e no primeiro acesso
const esconderRodape = pathname.includes('/pegada') && (usuario?.primeiroAcesso || exibindoResultado);

  useEffect(() => {
    setIsReady(true);
  }, []);

  // 🔐 Controle de acesso por tipo de usuário
  useEffect(() => {
    if (!isReady || !usuario) return;

    if (!usuario) {
      router.replace('/(public)/login');
      return;
    }

    const rota = pathname.toLowerCase();

    // 🔒 Bloqueia rotas específicas de PJ
    if (
      rota.includes('catalogorecompensapj') ||
      rota.includes('validarvoucherpj') ||
      rota.includes('faleconosco')
    ) {
      if (usuario.tipo !== 'pj') {
        router.replace('/(private)/home');
      }
    }

    // 🔒 Bloqueia rotas específicas de PF
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

        {/* 🔥 Rodapé aparece em tudo, menos se for primeiro acesso na pegada */}
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
