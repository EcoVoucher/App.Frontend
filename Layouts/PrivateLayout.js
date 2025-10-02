// app/Layouts/PrivateLayout.js
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCarrinho } from '../context/CarrinhoContext';           
import RodapeNavegacao from '../components/RodapeNavegacao';
import { useAuth } from '../context/AuthContext';                    
import { useRouter, Slot, usePathname } from 'expo-router';
import { useModalCarrinho } from '../context/ModalCarrinhoContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export default function PrivateLayout() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  const { abrirResumo } = useModalCarrinho();
  const { selecionados } = useCarrinho();

  const isAdmin = usuario?.isAdmin === true || String(usuario?.isAdmin).toLowerCase() === 'true';

  const estaNoCatalogoPF = pathname.includes('/catalogovoucherspf');
  const estaNaPegada = pathname.includes('/pegada');
  const exibindoResultado = estaNaPegada && usuario?.primeiroAcesso && !pathname.includes('/home');
  const esconderRodape = pathname.includes('/pegada') && (usuario?.primeiroAcesso || exibindoResultado);

  useEffect(() => {
    setIsReady(true);
  }, []);

  useEffect(() => {
    if (!isReady) return;

    // sessão ainda carregando → não decide nada
    if (carregando) return;

    // sem usuário → volta ao login
    if (!usuario) {
      router.replace('/(public)/login');
      return;
    }

    const rota = pathname.toLowerCase();

    // admin deve ficar nas telas de admin
    if (isAdmin && !rota.includes('/admin')) {
      router.replace('/(private)/admin');
      return;
    }

    // rotas exclusivas de PJ
    if (rota.includes('catalogorecompensapj') || rota.includes('validarvoucherpj')) {
      if (usuario.tipo !== 'pj') {
        router.replace('/(private)/home');
        return;
      }
    }

    // rotas exclusivas de PF
    if (
      rota.includes('pegada') ||
      rota.includes('historicopontos') ||
      rota.includes('catalogovoucherspf') ||
      rota.includes('historicopegada') ||
      rota.includes('pontoscoleta')
    ) {
      if (usuario.tipo !== 'pf') {
        router.replace('/(private)/home');
      }
    }
  }, [isReady, carregando, usuario, pathname]);

  // Enquanto carrega ou redireciona, mostra um loading para evitar flash
  if (carregando || !usuario) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.fundo} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.verde} />
        </View>
      </SafeAreaView>
    );
  }

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

        {!isAdmin && estaNoCatalogoPF && selecionados.length > 0 && (
          <TouchableOpacity onPress={abrirResumo} style={styles.botaoCarrinho}>
            <MaterialCommunityIcons name="cart" size={28} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{selecionados.length}</Text>
            </View>
          </TouchableOpacity>
        )}

        {!esconderRodape && !isAdmin && (
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
  botaoCarrinho: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 100 : 110,
    right: 20,
    backgroundColor: colors.verde,
    padding: 16,
    borderRadius: 50,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    zIndex: 9999,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.vermelho,
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTexto: {
    color: colors.branco,
    fontSize: 12,
    fontWeight: 'bold',
  },
  rodape: {},
});
