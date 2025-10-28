// components/OnboardingCarousel.js
import React, { useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Linking, // <-- novo para abrir o vídeo
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Entypo, FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

// Imagens usadas nos cards da Home
const imgLogo        = require('../assets/imagensEco/ecoVoucherIcon.png');
const imgHistorico   = require('../assets/imagensEco/historicoIcon.png');
const imgCatalogoPF  = require('../assets/imagensEco/catalogoIcon.png');
const imgColeta      = require('../assets/imagensEco/pontoColetaIcon.png');
const imgGerar       = require('../assets/imagensEco/gerarVoucherIcon.png');
const imgValidar     = require('../assets/imagensEco/validarVoucherIcon.png');
const imgContato     = require('../assets/imagensEco/faleConoscoIcon.png');

// podemos usar o próprio logo como thumb de vídeo por enquanto
const imgThumbVideo  = imgLogo;

/**
 * Mini-componente para o preview do vídeo institucional.
 * - Mostra uma thumbnail com botão de play
 * - Ao tocar, abre o YouTube no app/navegador
 */
function VideoPreview({ url }) {
  const abrirVideo = async () => {
    try {
      const suportado = await Linking.canOpenURL(url);
      if (suportado) {
        Linking.openURL(url);
      } else {
        console.log('Não foi possível abrir o link do vídeo:', url);
      }
    } catch (e) {
      console.log('Erro ao abrir vídeo:', e);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={abrirVideo}
      style={styles.videoWrapper}
    >
      <View style={styles.videoThumb}>
        <Image source={imgThumbVideo} style={styles.videoImage} />

        <View style={styles.playButton}>
          <Entypo name="controller-play" size={28} color={colors.branco} />
        </View>
      </View>

      <Text style={styles.videoLabel}>Assistir apresentação</Text>
    </TouchableOpacity>
  );
}

/**
 * Props:
 *  - visible: boolean
 *  - onClose: () => void
 *  - tipo: 'pf' | 'pj'
 */
export default function OnboardingCarousel({ visible, onClose, tipo = 'pf' }) {
  const { width } = useWindowDimensions();
  const isLarge = width > 520;
  const cardWidth = Math.min(width * 0.9, 380);

  const { usuario } = useAuth();
  const router = useRouter();

  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Helper para capitalizar nome da PF/PJ
  const nomeFormatado = (usuario?.nome || usuario?.nomeEmpresa || '')
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());

  // Preview visual do rodapé (estático, sem navegação)
  const RodapePreview = () => (
    <View style={styles.footerPreview}>
      <View style={styles.footerItem}>
        <FontAwesome name="home" size={20} color={colors.verde} />
        <Text style={styles.footerItemTxt}>Home</Text>
      </View>
      <View style={styles.footerItem}>
        <FontAwesome name="search" size={20} color={colors.cinza} />
        <Text style={styles.footerItemTxt}>Buscar</Text>
      </View>
      <View style={styles.footerItem}>
        <FontAwesome name={usuario ? 'sign-out' : 'user'} size={20} color={colors.cinza} />
        <Text style={styles.footerItemTxt}>{usuario ? 'Logout' : 'Login'}</Text>
      </View>
      <View style={styles.footerItem}>
        <Entypo name="dots-three-horizontal" size={20} color={colors.cinza} />
        <Text style={styles.footerItemTxt}>Menu</Text>
      </View>
    </View>
  );

  // Preview visual do menu lateral (estático)
  const MenuPreview = () => (
    <View style={styles.menuCard}>
      <Text style={styles.menuTitulo}>MENU</Text>

      <View style={styles.menuLinha}>
        <MaterialCommunityIcons name="recycle" size={20} color={colors.verde} />
        <Text style={styles.menuLinhaTxt}>Conheça o Eco Voucher</Text>
      </View>

      <View style={styles.menuLinha}>
        <MaterialCommunityIcons name="whatsapp" size={20} color={colors.verde} />
        <Text style={styles.menuLinhaTxt}>Fale pelo WhatsApp</Text>
      </View>

      <View style={styles.menuLinha}>
        <MaterialCommunityIcons name="history" size={20} color={colors.verde} />
        <Text style={styles.menuLinhaTxt}>Histórico Pegada</Text>
      </View>

      <View style={styles.menuLinha}>
        <MaterialCommunityIcons name="account" size={20} color={colors.verde} />
        <Text style={styles.menuLinhaTxt}>Seu Perfil</Text>
      </View>
    </View>
  );

  // Bloco da Home PF preview
  const HomePreviewPF = () => (
    <View style={styles.homeCard}>
      <View style={styles.homeHeader}>
        <Image source={imgLogo} style={styles.homeLogo} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text
            style={[
              styles.homeTitulo,
              { fontSize: isLarge ? fonts.size.lg : fonts.size.md },
            ]}
            numberOfLines={1}
          >
            Olá, {nomeFormatado || 'Usuário'}
          </Text>
          <Text
            style={[
              styles.homeSubtitulo,
              { fontSize: isLarge ? fonts.size.md : fonts.size.sm },
            ]}
            numberOfLines={1}
          >
            Transforme suas ações em benefícios.
          </Text>
        </View>
      </View>

      <Text style={styles.homeInfoLinha}>
        💚 Pontos Disponíveis: <Text style={styles.homeValor}>0</Text>
      </Text>
      <Text style={styles.homeInfoLinha}>
        🌿 Pegada Ecológica:{' '}
        <Text style={[styles.homeValor, { color: colors.verde }]}>240 pts</Text>
      </Text>
      <Text style={styles.homeInfoDesc}>
        <Text style={{ fontStyle: 'italic' }}>
          • Abaixo da média mundial (~2.7 gha).
        </Text>
      </Text>

      <View style={styles.botaoAtualizar}>
        <Text style={styles.botaoAtualizarTxt}>Atualizar Pegada</Text>
      </View>
    </View>
  );

  // Grid de ações PF
  const AcoesPFPreview = () => (
    <View style={styles.iconesWrapper}>
      <View style={styles.iconeItem}>
        <Image source={imgHistorico} style={styles.iconeImg} />
        <Text style={styles.iconeTxt}>{'Histórico\nde Pontos'}</Text>
      </View>

      <View style={styles.iconeItem}>
        <Image source={imgCatalogoPF} style={styles.iconeImg} />
        <Text style={styles.iconeTxt}>{'Vouchers\npara Troca'}</Text>
      </View>

      <View style={styles.iconeItem}>
        <Image source={imgColeta} style={styles.iconeImg} />
        <Text style={styles.iconeTxt}>{'Pontos\nde Coleta'}</Text>
      </View>

      <View style={styles.barraODS}>
        <Text style={styles.barraODSTxt}>
          🌍 Contribua com os ODS da ONU.
        </Text>
      </View>
    </View>
  );

  // Slides PF na ordem combinada
  const slidesPF = useMemo(
    () => [
      {
        tipoLayout: 'intro',
        titulo: 'Conheça o EcoVoucher',
        desc:
          'O EcoVoucher transforma ações sustentáveis em benefícios reais. Você recicla, acumula pontos e troca por vantagens locais.',
        extra: (
          <View style={{ alignItems: 'center', width: '100%' }}>
            <VideoPreview url="https://youtu.be/uur_Qz6eobs" />

            <Text style={styles.descMenor}>
              Você também pode ver essa apresentação depois em
              {' '}“Conheça o Eco Voucher”, dentro do Menu.
            </Text>
          </View>
        ),
      },
      {
        tipoLayout: 'rodape',
        titulo: 'Navegação Principal/Rodapé',
        desc:
          'Esta é sua barra fixa. Use para acessar a Home, buscar parceiros e pontos de coleta, sair da conta e abrir mais opções.',
        extra: <RodapePreview />,
      },
      {
        tipoLayout: 'menu',
        titulo: 'Menu Rápido',
        desc:
          'Aqui você encontra ajuda e mais recursos: apresentação do projeto, contato direto via WhatsApp, histórico da sua pegada e seu perfil.',
        extra: <MenuPreview />,
      },
      {
        tipoLayout: 'home',
        titulo: 'Seu Painel Pessoal',
        desc:
          'Na Home você vê seu nome, seus pontos, sua pegada ecológica e pode atualizar sua pontuação.',
        extra: <HomePreviewPF />,
      },
      {
        tipoLayout: 'acoes',
        titulo: 'Ganhe, Troque, Acompanhe',
        desc:
          'Deposite materiais e ganhe pontos, troque por benefícios reais e acompanhe tudo com transparência.',
        extra: <AcoesPFPreview />,
      },
    ],
    [isLarge, nomeFormatado]
  );

  // Slides PJ (versão empresa / parceiro)
  const slidesPJ = useMemo(
    () => [
      {
        tipoLayout: 'intro',
        titulo: 'Conheça o EcoVoucher',
        desc:
          'Você é nosso parceiro. Gere recompensas para incentivar práticas sustentáveis e acompanhe o uso pelos clientes.',
        extra: (
          <View style={{ alignItems: 'center', width: '100%' }}>
            <VideoPreview url="https://youtu.be/SEU_VIDEO_AQUI" />

            <Text style={styles.descMenor}>
              A apresentação completa está sempre em
              {' '}“Conheça o Eco Voucher” no Menu.
            </Text>
          </View>
        ),
      },
      {
        tipoLayout: 'rodape',
        titulo: 'Navegação da Empresa',
        desc:
          'Use a barra inferior para ir até sua Home, gerar novos vouchers, validar vouchers no balcão e acessar mais opções.',
        extra: (
          <View style={styles.footerPreview}>
            <View style={styles.footerItem}>
              <FontAwesome name="home" size={20} color={colors.verde} />
              <Text style={styles.footerItemTxt}>Home</Text>
            </View>
            <View style={styles.footerItem}>
              <Image source={imgGerar} style={styles.iconeImgMini} />
              <Text style={styles.footerItemTxt}>Gerar</Text>
            </View>
            <View style={styles.footerItem}>
              <Image source={imgValidar} style={styles.iconeImgMini} />
              <Text style={styles.footerItemTxt}>Validar</Text>
            </View>
            <View style={styles.footerItem}>
              <Entypo name="dots-three-horizontal" size={20} color={colors.cinza} />
              <Text style={styles.footerItemTxt}>Menu</Text>
            </View>
          </View>
        ),
      },
      {
        tipoLayout: 'menu',
        titulo: 'Suporte e Relacionamento',
        desc:
          'No menu lateral você acessa o perfil da empresa e contato direto (WhatsApp) com a equipe.',
        extra: (
          <View style={styles.menuCard}>
            <Text style={styles.menuTitulo}>MENU</Text>
            <View style={styles.menuLinha}>
              <MaterialCommunityIcons name="recycle" size={20} color={colors.verde} />
              <Text style={styles.menuLinhaTxt}>Conheça o Eco Voucher</Text>
            </View>
            <View style={styles.menuLinha}>
              <MaterialCommunityIcons name="account" size={20} color={colors.verde} />
              <Text style={styles.menuLinhaTxt}>Seu Perfil</Text>
            </View>
          </View>
        ),
      },
      {
        tipoLayout: 'home',
        titulo: 'Painel da Empresa',
        desc:
          'Acompanhe vouchers gerados e utilizados. Entenda o impacto do seu programa de benefícios.',
        extra: (
          <View style={styles.homeCard}>
            <View style={styles.homeHeader}>
              <Image source={imgLogo} style={styles.homeLogo} />
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={[
                    styles.homeTitulo,
                    { fontSize: isLarge ? fonts.size.lg : fonts.size.md },
                  ]}
                  numberOfLines={1}
                >
                  {nomeFormatado || 'Sua Empresa'}
                </Text>
                <Text
                  style={[
                    styles.homeSubtitulo,
                    { fontSize: isLarge ? fonts.size.md : fonts.size.sm },
                  ]}
                  numberOfLines={1}
                >
                  Vouchers gerados e uso pelos clientes.
                </Text>
              </View>
            </View>

            <Text style={styles.homeInfoLinha}>
              📦 Vouchers gerados: <Text style={styles.homeValor}>--</Text>
            </Text>
            <Text style={styles.homeInfoLinha}>
              ✅ Adquiridos por PF: <Text style={styles.homeValor}>--</Text>
            </Text>
          </View>
        ),
      },
      {
        tipoLayout: 'acoes',
        titulo: 'Próximo Passo',
        desc:
          'Gere lotes de vouchers e valide na hora da troca. Simples, rápido e rastreável.',
        extra: (
          <View style={styles.iconesWrapper}>
            <View style={styles.iconeItem}>
              <Image source={imgGerar} style={styles.iconeImg} />
              <Text style={styles.iconeTxt}>{'Gerar\nVoucher'}</Text>
            </View>
            <View style={styles.iconeItem}>
              <Image source={imgValidar} style={styles.iconeImg} />
              <Text style={styles.iconeTxt}>{'Validar\nVoucher'}</Text>
            </View>
            <View style={styles.iconeItem}>
              <Image source={imgContato} style={styles.iconeImg} />
              <Text style={styles.iconeTxt}>{'Contato\nEquipe'}</Text>
            </View>
          </View>
        ),
      },
    ],
    [isLarge, nomeFormatado]
  );

  const data = tipo === 'pj' ? slidesPJ : slidesPF;

  async function finalizarOnboarding(acaoPrimaria) {
    // salva flag de "já vi" (você pode ligar isso depois se quiser usar só 1x)
    try {
      await AsyncStorage.setItem(
        tipo === 'pj' ? '@onboardingVistoPJ' : '@onboardingVistoPF',
        'true'
      );
    } catch (e) {
      console.log('erro ao salvar onboarding visto', e);
    }

    // dispara navegação inicial se quiser garantir landing
    if (acaoPrimaria === 'homePF') {
      router.replace('/home');
    } else if (acaoPrimaria === 'homePJ') {
      router.replace('/home'); // ajuste aqui se PJ tiver rota própria
    }

    onClose?.();
  }

  const next = () => {
    if (index >= data.length - 1) {
      // último slide -> finalizar
      return finalizarOnboarding(tipo === 'pj' ? 'homePJ' : 'homePF');
    }
    carouselRef.current?.next?.();
  };

  const passosTxt = `${index + 1}/${data.length}`;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { width: cardWidth }]}>
          {/* botão "pular" */}
          <TouchableOpacity style={styles.skip} onPress={() => finalizarOnboarding()}>
            <Text style={styles.skipTxt}>Pular</Text>
          </TouchableOpacity>

          {/* carrossel */}
          <Carousel
            ref={carouselRef}
            width={cardWidth - spacing.md * 2}
            height={isLarge ? 480 : 440}
            data={data}
            loop={false}
            onSnapToItem={setIndex}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                {/* título */}
                <Text
                  style={[
                    styles.title,
                    { fontSize: isLarge ? fonts.size.lg : fonts.size.md },
                  ]}
                >
                  {item.titulo}
                </Text>

                {/* descrição */}
                <Text
                  style={[
                    styles.desc,
                    { fontSize: isLarge ? fonts.size.md : fonts.size.sm },
                  ]}
                >
                  {item.desc}
                </Text>

                {/* bloco extra visual específico do slide */}
                <View style={styles.extraWrapper}>{item.extra}</View>
              </View>
            )}
          />

          {/* footer com dots + CTA */}
          <View style={styles.footer}>
            <View style={styles.dots}>
              {data.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === index && styles.dotActive]}
                />
              ))}
            </View>

            <Text style={styles.passos}>{passosTxt}</Text>

            <TouchableOpacity style={styles.cta} onPress={next}>
              <Text style={styles.ctaTxt}>
                {index === data.length - 1 ? 'Começar' : 'Próximo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  card: {
    maxWidth: '95%',
    backgroundColor: colors.branco,
    borderRadius: 16,
    padding: spacing.md,
    ...Platform.select({
      android: { elevation: 3 },
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.08,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  skip: { alignSelf: 'flex-end', padding: 6, marginBottom: 2 },
  skipTxt: {
    color: colors.cinza,
    textDecorationLine: 'underline',
    fontSize: fonts.size.sm,
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.md,
  },
  title: {
    color: colors.verde,
    fontWeight: fonts.weight.bold,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  desc: {
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  descMenor: {
    color: colors.cinza,
    fontSize: fonts.size.sm,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  extraWrapper: {
    width: '100%',
    marginTop: spacing.md,
    alignItems: 'center',
  },

  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: colors.borda,
  },
  dotActive: { width: 20, backgroundColor: colors.verde },
  passos: {
    color: colors.cinza,
    fontSize: fonts.size.sm,
    fontWeight: '500',
  },
  cta: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
  },
  ctaTxt: { color: colors.verde, fontWeight: 'bold' },

  // preview do rodapé
  footerPreview: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.borda,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.branco,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  footerItem: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  footerItemTxt: {
    fontSize: fonts.size.xs,
    marginTop: 4,
    textAlign: 'center',
    color: colors.cinza,
  },

  // preview menu lateral
  menuCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borda,
    backgroundColor: colors.branco,
    padding: spacing.md,
  },
  menuTitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.sm,
  },
  menuLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borda,
  },
  menuLinhaTxt: {
    marginLeft: spacing.sm,
    fontSize: fonts.size.sm,
    color: colors.verde,
    fontWeight: '500',
  },

  // preview da home PF/PJ
  homeCard: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borda,
    backgroundColor: colors.branco,
    padding: spacing.md,
  },
  homeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  homeLogo: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
    marginRight: spacing.sm,
  },
  homeTitulo: {
    color: colors.verde,
    fontWeight: fonts.weight.bold,
  },
  homeSubtitulo: {
    color: colors.cinza,
  },
  homeInfoLinha: {
    color: colors.verde,
    marginBottom: 4,
    fontSize: fonts.size.sm,
  },
  homeInfoDesc: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
    marginBottom: spacing.sm,
  },
  homeValor: {
    fontWeight: 'bold',
  },
  botaoAtualizar: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.sm,
    alignItems: 'center',
    width: 180,
    alignSelf: 'flex-start',
  },
  botaoAtualizarTxt: {
    color: colors.verde,
    fontWeight: 'bold',
    fontSize: fonts.size.sm,
  },

  // bloco de ações PF / PJ
  iconesWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  iconeItem: {
    width: '100%',
    maxWidth: 320,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borda,
    backgroundColor: colors.branco,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  iconeImg: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  iconeImgMini: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  iconeTxt: {
    flexShrink: 1,
    color: colors.verde,
    fontWeight: fonts.weight.medium,
    fontSize: fonts.size.sm,
    lineHeight: Math.round(fonts.size.sm * 1.3),
  },

  barraODS: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.verdeClaro,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  barraODSTxt: {
    textAlign: 'center',
    color: colors.verde,
    fontWeight: fonts.weight.bold,
    fontSize: fonts.size.sm,
  },

  // vídeo de apresentação
  videoWrapper: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 260,
    marginBottom: spacing.sm,
  },
  videoThumb: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.verdeClaro,
    borderWidth: 1,
    borderColor: colors.verdeClaro,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  videoImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
    opacity: 0.9,
  },
  playButton: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.verde,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  videoLabel: {
    marginTop: spacing.xs,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
  },
});
