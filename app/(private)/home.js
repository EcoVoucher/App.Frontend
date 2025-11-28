import React, { useEffect, useState, useRef, useCallback } from 'react';
import { AppState, View, Text, StyleSheet, useWindowDimensions, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useAuth } from '../../context/AuthContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import AnimatedCard from '../../components/AnimatedCard';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { apenasNumeros } from '../../utils/formatarenvio';
import { UsuarioService } from '../../services/usuarioService';
import { VouchersService } from '../../services/voucherService';
import { PegadaService } from '../../services/pegadaService';
import { obterComparativoPegada } from '../../utils/formatadores';

const toResult = (res) =>
  res && typeof res === 'object' && 'ok' in res ? res : { ok: true, data: res };

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 500;
  const { usuario } = useAuth();

  const [pegada, setPegada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [qtdVouchers, setQtdVouchers] = useState(0);
  const [vouchersUtilizados, setVouchersUtilizados] = useState(0);
  const [icones, setIcones] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // ✓ proteção de estado após desmontagem
  const isMounted = useRef(false);

  // ✓ TTL simples: só recarrega se a última carga tiver mais de 60s
  const lastLoadTs = useRef(0);
  const STALE_MS = 60_000;

  // ✓ detectar retorno do app ao primeiro plano
  const appState = useRef(AppState.currentState);

  const mensagens = [
    { texto: '🌱 Acompanhe sua pegada ecológica.' },
    { texto: '📍 Encontre pontos de coleta próximos de você.' },
    { texto: '🌍 Contribua com os ODS da ONU.' },
  ];

  const safeSet = useCallback((fn) => (...args) => {
    if (isMounted.current) fn(...args);
  }, []);

  const carregarDados = useCallback(
    async (force = false) => {
      if (!usuario) {
        safeSet(setCarregando)(false);
        return;
      }

      const now = Date.now();
      const isStale = now - lastLoadTs.current > STALE_MS;
      if (!force && !isStale) return;

      try {
        safeSet(setCarregando)(true);

        const documento = apenasNumeros(usuario.cpf ?? usuario.cnpj ?? '');
        const uRes = toResult(await UsuarioService.obterPorId(documento));

        if (uRes.ok) {
          safeSet(setPontos)(uRes.data?.pontos ?? 0);

          if (usuario.tipo === 'pf') {
            try {
              const ultima = await PegadaService.obterUltimaPontuacao(documento);
              safeSet(setPegada)(ultima?.pontuacao ?? (uRes.data?.pontuacao ?? null));
            } catch {
              safeSet(setPegada)(uRes.data?.pontuacao ?? null);
            }

            safeSet(setIcones)([
              { imagem: require('../../assets/imagensEco/historicoIcon.png'), rota: '/historicopontos', label: 'Histórico \nde Pontos' },
              { imagem: require('../../assets/imagensEco/catalogoIcon.png'), rota: '/catalogovoucherspf', label: 'Vouchers \npara Troca' },
              { imagem: require('../../assets/imagensEco/pontoColetaIcon.png'), rota: '/pontoscoleta', label: 'Pontos \nde Coleta' },
            ]);
          }

          if (usuario.tipo === 'pj') {
            const [lv, est] = await Promise.all([
              VouchersService.listarVouchers(),
              VouchersService.obterEstatisticas(),
            ]);

            const lvRes = toResult(lv);
            const estRes = toResult(est);

            const totalGerados = Array.isArray(lvRes.data)
              ? lvRes.data.reduce((acc, v) => acc + (v.quantidade || 0), 0)
              : 0;

            safeSet(setQtdVouchers)(totalGerados);
            safeSet(setVouchersUtilizados)(estRes.data?.totalComprados ?? 0);

            safeSet(setIcones)([
              { imagem: require('../../assets/imagensEco/gerarVoucherIcon.png'), rota: '/catalogorecompensapj', label: 'Gerar Voucher' },
              { imagem: require('../../assets/imagensEco/validarVoucherIcon.png'), rota: '/validarvoucherpj', label: 'Validar Voucher' },
              { imagem: require('../../assets/imagensEco/faleConoscoIcon.png'), rota: '/chatbot', label: 'Assistente \nVirtual' }
            ]);
          }
        } else {
          console.warn('Home obterPorId:', uRes.error);
        }
      } catch (error) {
        const mensagem = obterMensagemErro(error, 'Erro ao carregar dados da Home.');
        console.warn('⚠️ Erro na Home:', mensagem);
      } finally {
        lastLoadTs.current = Date.now();
        safeSet(setCarregando)(false);
      }
    },
    [usuario, safeSet]
  );

  // montar / desmontar
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // 1) primeira carga (ou quando trocar de usuário)
  useEffect(() => {
    if (!usuario) { setCarregando(false); return; }
    carregarDados(true); // força primeira carga
  }, [usuario, carregarDados]);

  // 2) refetch quando a tela ganhar foco (respeita TTL)
  useFocusEffect(
    useCallback(() => {
      carregarDados(false);
    }, [carregarDados])
  );

  // 3) refetch quando o app voltar ao primeiro plano (respeita TTL)
  useEffect(() => {
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === 'active') {
        carregarDados(false);
      }
      appState.current = nextState;
    });
    return () => sub.remove();
  }, [carregarDados]);

  return (
    <View style={styles.container}>
      <View style={styles.blocoInformativo}>
        <View style={styles.cabecalho}>
          <Image
            source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.logo}
          />
          <View style={styles.boasVindas}>
            <Text
              style={[
                styles.titulo,
                { fontSize: isLargeScreen ? fonts.size.xl : fonts.size.lg },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.85}
            >
              Olá, {(usuario?.nome || usuario?.nomeEmpresa || '')
                .toLowerCase()
                .replace(/\b\w/g, (l) => l.toUpperCase())}
            </Text>
            <Text
              style={[
                styles.subtitulo,
                { fontSize: isLargeScreen ? fonts.size.md : fonts.size.sm },
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Transforme suas ações em benefícios.
            </Text>
          </View>
        </View>

        {usuario?.tipo === 'pf' ? (
          <>
            <Text style={styles.destaqueItem}>
              💚 Pontos Disponíveis: <Text style={styles.valor}>{pontos}</Text>
            </Text>
            <Text style={styles.destaqueItem}>
              🌿 Pegada Ecológica:{' '}
              <Text style={[styles.valor, { color: colors.verde }]}>
                {pegada ?? '---'} pts
              </Text>
            </Text>
            {pegada != null && (
              <Text style={styles.destaqueItemDesc}>
                <Text style={{ fontStyle: 'italic' }}>
                  {obterComparativoPegada(pegada)}
                </Text>
              </Text>
            )}
            <TouchableOpacity
              onPress={() => router.push('/pegada')}
              style={[styles.botaoPrincipal, { width: isLargeScreen ? 220 : 180 }]}
            >
              <Text
                style={[
                  styles.botaoPrincipalTexto,
                  { fontSize: isLargeScreen ? fonts.size.md : fonts.size.sm },
                ]}
              >
                Atualizar Pegada
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.destaqueItem}>
              📦 Vouchers gerados: <Text style={styles.valor}>{qtdVouchers}</Text>
            </Text>
            <Text style={styles.destaqueItem}>
              ✅ Adquiridos por PF:{' '}
              <Text style={styles.valor}>{vouchersUtilizados}</Text>
            </Text>
          </>
        )}
      </View>

      <View style={styles.conteudoCentral}>
        <View style={styles.grid}>
          {icones.map((item, index) => (
            <AnimatedCard
              key={index}
              imagem={item.imagem}
              rota={item.rota}
              label={item.label}
              onPress={item.onPress}
            />
          ))}
        </View>

        <View style={styles.carouselContainer}>
          <Carousel
            loop
            width={width * 0.9}
            height={isLargeScreen ? 60 : 50}
            autoPlay
            scrollAnimationDuration={4000}
            data={mensagens}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.carouselItem,
                  {
                    paddingHorizontal: isLargeScreen ? spacing.lg : spacing.md,
                    minHeight: isLargeScreen ? 60 : 50,
                  },
                ]}
              >
                <Text style={styles.carouselText}>{item.texto}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  conteudoCentral: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  blocoInformativo: {
    width: '100%',
    backgroundColor: colors.branco,
    borderColor: colors.borda,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  cabecalho: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  logo: { width: 60, height: 60, resizeMode: 'contain', marginRight: spacing.sm, flexShrink: 0 },
  boasVindas: { flex: 1, minWidth: 0 },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    lineHeight: Math.round(fonts.size.lg * 1.2),
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    lineHeight: Math.round(fonts.size.sm * 1.3),
  },
  destaqueItem: { fontSize: fonts.size.md, color: colors.verde, marginBottom: 4 },
  destaqueItemDesc: { fontSize: fonts.size.sm, color: colors.cinza, marginBottom: 8 },
  valor: { fontWeight: 'bold' },
  botaoPrincipal: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.md,
    alignItems: 'center',
    width: 200,
  },
  botaoPrincipalTexto: { color: colors.verde, fontWeight: 'bold', fontSize: fonts.size.md },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  carouselContainer: { marginTop: spacing.lg, marginBottom: spacing.sm },
  carouselItem: {
    backgroundColor: colors.verdeClaro,
    padding: spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselText: {
    fontSize: fonts.size.sm,
    color: colors.verde,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
