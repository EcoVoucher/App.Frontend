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
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

// Imagens do seu projeto (ajuste se necessário)
const imgLogo        = require('../assets/imagensEco/ecoVoucherIcon.png');
const imgHistorico   = require('../assets/imagensEco/historicoIcon.png');
const imgCatalogoPF  = require('../assets/imagensEco/catalogoIcon.png');
const imgColeta      = require('../assets/imagensEco/pontoColetaIcon.png');
const imgGerar       = require('../assets/imagensEco/gerarVoucherIcon.png');
const imgValidar     = require('../assets/imagensEco/validarVoucherIcon.png');
const imgContato     = require('../assets/imagensEco/faleConoscoIcon.png');

/**
 * Props:
 *  - visible: boolean        => controla abertura do modal
 *  - onClose: () => void     => chamado ao fechar / terminar
 *  - tipo: 'pf' | 'pj'       => muda o conteúdo (default: 'pf')
 */
export default function OnboardingCarousel({ visible, onClose, tipo = 'pf' }) {
  const { width } = useWindowDimensions();
  const isLarge = width > 520;
  const cardWidth = Math.min(width * 0.9, 380);

  const carouselRef = useRef(null);
  const [index, setIndex] = useState(0);

  const slidesPF = useMemo(
    () => [
      {
        img: imgLogo,
        t: 'Bem-vindo(a) ao EcoVoucher',
        d: 'Acompanhe sua pegada ecológica e transforme ações em benefícios.',
      },
      {
        img: imgHistorico,
        t: 'Histórico de Pontos',
        d: 'Veja entradas de pontos e trocas por vouchers.',
      },
      {
        img: imgCatalogoPF,
        t: 'Vouchers para Troca',
        d: 'Use seus pontos para resgatar benefícios no catálogo.',
      },
      {
        img: imgColeta,
        t: 'Pontos de Coleta',
        d: 'Encontre pontos de coleta próximos para pontuar ainda mais.',
      },
    ],
    []
  );

  const slidesPJ = useMemo(
    () => [
      {
        img: imgLogo,
        t: 'Bem-vindo(a), Parceiro(a)!',
        d: 'Gere, valide e acompanhe os vouchers da sua empresa.',
      },
      {
        img: imgGerar,
        t: 'Gerar Vouchers',
        d: 'Crie lotes e distribua recompensas com poucos toques.',
      },
      {
        img: imgValidar,
        t: 'Validar Vouchers',
        d: 'Valide vouchers apresentados pelos clientes rapidamente.',
      },
      {
        img: imgContato,
        t: 'Apoio & Contato',
        d: 'Fale com a equipe pelo WhatsApp sempre que precisar.',
      },
    ],
    []
  );

  const data = tipo === 'pj' ? slidesPJ : slidesPF;

  const next = () => {
    if (index >= data.length - 1) return onClose?.();
    carouselRef.current?.next?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, { width: cardWidth }]}>
          <TouchableOpacity style={styles.skip} onPress={onClose} hitSlop={10}>
            <Text style={styles.skipTxt}>Pular</Text>
          </TouchableOpacity>

          <Carousel
            ref={carouselRef}
            width={cardWidth - spacing.md * 2}
            height={isLarge ? 420 : 380}
            data={data}
            loop={false}
            onSnapToItem={setIndex}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                <Image source={item.img} style={styles.img} />
                <Text
                  style={[
                    styles.title,
                    { fontSize: isLarge ? fonts.size.lg : fonts.size.md },
                  ]}
                >
                  {item.t}
                </Text>
                <Text
                  style={[
                    styles.desc,
                    { fontSize: isLarge ? fonts.size.md : fonts.size.sm },
                  ]}
                >
                  {item.d}
                </Text>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View style={styles.dots}>
              {data.map((_, i) => (
                <View
                  key={i}
                  style={[styles.dot, i === index && styles.dotActive]}
                />
              ))}
            </View>
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
  skipTxt: { color: colors.cinza, textDecorationLine: 'underline', fontSize: fonts.size.sm },
  slide: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  img: { width: 120, height: 120, resizeMode: 'contain', marginBottom: spacing.md },
  title: { color: colors.verde, fontWeight: fonts.weight.bold, textAlign: 'center', marginBottom: spacing.xs },
  desc: { color: colors.textDark, textAlign: 'center' },
  footer: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: { flexDirection: 'row', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 8, backgroundColor: colors.borda },
  dotActive: { width: 20, backgroundColor: colors.verde },
  cta: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
  },
  ctaTxt: { color: colors.verde, fontWeight: 'bold' },
});
