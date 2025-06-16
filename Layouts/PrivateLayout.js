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
  const { usuario } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  const { abrirResumo } = useModalCarrinho(); // 👉 Importante
  const { selecionados } = useCarrinho();
  const estaNoCatalogoPF = pathname.includes('/catalogovoucherspf');

  const estaNaPegada = pathname.includes('/pegada');
  const exibindoResultado =
    estaNaPegada && usuario?.primeiroAcesso && !pathname.includes('/home');
  const esconderRodape =
    pathname.includes('/pegada') &&
    (usuario?.primeiroAcesso || exibindoResultado);

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

        {estaNoCatalogoPF && selecionados.length > 0 && (
          <TouchableOpacity
            onPress={abrirResumo} // 🔥 Aqui faz abrir o modal de resumo
            style={styles.botaoCarrinho}
          >
            <MaterialCommunityIcons name="cart" size={28} color="#fff" />
            <View style={styles.badge}>
              <Text style={styles.badgeTexto}>{selecionados.length}</Text>
            </View>
          </TouchableOpacity>
        )}

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
