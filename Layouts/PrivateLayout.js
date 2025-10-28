// app/Layouts/PrivateLayout.js
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform,
  SafeAreaView, StatusBar, TouchableOpacity, Text, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useCarrinho } from '../context/CarrinhoContext';
import RodapeNavegacao from '../components/RodapeNavegacao';
import { useAuth } from '../context/AuthContext';
import { useRouter, Slot, usePathname } from 'expo-router';
import { useModalCarrinho } from '../context/ModalCarrinhoContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

// ⬇️ IMPORTAMOS O ONBOARDING
import OnboardingCarousel from '../components/OnboardingCarousel';

export default function PrivateLayout() {
  const { usuario, carregando } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  // ⬇️ CONTROLE DO ONBOARDING (modal)
  const [showOnboarding, setShowOnboarding] = useState(false);

  const { abrirResumo } = useModalCarrinho();
  const { selecionados } = useCarrinho();

  const isAdmin =
    usuario?.isAdmin === true || String(usuario?.isAdmin).toLowerCase() === 'true';

  const rota = (pathname || '').toLowerCase();
  const estaNoCatalogoPF = rota.includes('/catalogovoucherspf');
  const estaNaPegada = rota.includes('/pegada');
  const exibindoResultado = estaNaPegada && usuario?.primeiroAcesso && !rota.includes('/home');
  const esconderRodape = rota.includes('/pegada') && (usuario?.primeiroAcesso || exibindoResultado);

  // ===== go seguro: evita replace para a mesma rota e limpa timer no unmount =====
  const timerRef = useRef(null);
  const go = (path) => {
    const alvo = (path || '').toLowerCase();
    if (alvo === rota) return;                     // já está na rota alvo
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try { router.replace(path); } catch {}
    }, 0);
  };
  useEffect(() => () => {                          // cleanup ao desmontar
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);
  // =============================================================================

  useEffect(() => { setIsReady(true); }, []);

  useEffect(() => {
    if (!isReady || carregando) return;

    // 1) sem sessão -> login
    if (!usuario) {
      go('/login');
      return;
    }

    // 2) admin deve ficar no espaço admin
    if (isAdmin && !rota.includes('/admin')) {
      go('/admin');
      return;
    }

    // 3) rotas exclusivas de PJ
    if (rota.includes('catalogorecompensapj') || rota.includes('validarvoucherpj')) {
      if (usuario?.tipo !== 'pj') {
        go('/home');
        return;
      }
    }

    // 4) rotas exclusivas de PF
    if (
      rota.includes('pegada') ||
      rota.includes('historicopontos') ||
      rota.includes('catalogovoucherspf') ||
      rota.includes('historicopegada') ||
      rota.includes('pontoscoleta')
    ) {
      if (usuario?.tipo !== 'pf') {
        go('/home');
      }
    }
  }, [isReady, carregando, usuario, rota]);

  // ⬇️ MOSTRAR OU NÃO O ONBOARDING
  useEffect(() => {
    if (!isReady || carregando || !usuario) return;

    // Regras de exibição:
    // - Admin não vê onboarding
    if (isAdmin) {
      setShowOnboarding(false);
      return;
    }

    // - PF em primeiro acesso ainda está na etapa obrigatória "pegada":
    //   não mostramos onboarding em cima da tela da pegada
    if (usuario?.tipo === 'pf' && usuario?.primeiroAcesso) {
      // se o usuário está em primeiro acesso, ele é mandado pra /pegada
      // queremos que o onboarding apareça SÓ depois disso
      // então aqui: não abre
      setShowOnboarding(false);
      return;
    }

    // - Se chegou aqui: pode mostrar onboarding
    //   FORÇADO: sempre que logar / acessar área privada
    setShowOnboarding(true);

    // Quando você quiser "só na primeira vez", troca o bloco acima por algo tipo:
    //
    // async function check() {
    //   const chave = usuario.tipo === 'pj' ? '@onboardingVistoPJ' : '@onboardingVistoPF';
    //   const jaViu = await AsyncStorage.getItem(chave);
    //   if (!jaViu) {
    //     setShowOnboarding(true);
    //   } else {
    //     setShowOnboarding(false);
    //   }
    // }
    // check();
  }, [isReady, carregando, usuario, isAdmin]);

  // Enquanto hidrata, mostra splash
  if (!isReady || carregando) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.fundo} />
        <View style={styles.center}><ActivityIndicator size="large" color={colors.verde} /></View>
      </SafeAreaView>
    );
  }

  // Se já detectou ausência de usuário, evita “flash” até o replace acontecer
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

        {!isAdmin && estaNoCatalogoPF && (selecionados?.length ?? 0) > 0 && (
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

        {/* ⬇️ ONBOARDING: FICA POR ÚLTIMO PRA FICAR POR CIMA DE TUDO */}
        <OnboardingCarousel
          visible={showOnboarding}
          tipo={usuario?.tipo === 'pj' ? 'pj' : 'pf'}
          onClose={() => setShowOnboarding(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

  safe: { flex: 1, backgroundColor: colors.fundo },

  container: { flex: 1, backgroundColor: colors.fundo, paddingTop: spacing.lg },

  conteudoWrapper: { flex: 1 },

  conteudo: { flexGrow: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 48 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  botaoCarrinho: {
    position: 'absolute', bottom: Platform.OS === 'web' ? 100 : 110, right: 20,
    backgroundColor: colors.verde, padding: 16, borderRadius: 50, elevation: 6,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }, zIndex: 9999,
  },
  
  badge: {
    position: 'absolute', top: 4, right: 4, backgroundColor: colors.vermelho,
    borderRadius: 12, paddingHorizontal: 6, paddingVertical: 2,
    justifyContent: 'center', alignItems: 'center',
  },
  badgeTexto: { color: colors.branco, fontSize: 12, fontWeight: 'bold' },
  rodape: {},
});
