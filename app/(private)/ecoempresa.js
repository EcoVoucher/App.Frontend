import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Linking,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

const frases = [
  { texto: '🌿 Contribua com o desenvolvimento sustentável.' },
  { texto: '♻️ A mudança começa com pequenas atitudes.' },
  { texto: '🌱 Cada ação conta para um planeta melhor.' },
];

export default function EcoEmpresa() {
  const { width } = useWindowDimensions();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.wrapper}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={styles.titulo}>Conheça o EcoVoucher</Text>
            <Text style={styles.subtitulo}>
              Uma solução sustentável que conecta empresas e pessoas à economia circular.
            </Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://www.youtube.com/watch?v=iWuV1oapv8s')}
              style={styles.thumbWrapper}
              accessibilityLabel="Abrir vídeo institucional no YouTube"
            >
              <Image
                source={require('../../assets/imagensEco/placeholder.png')}
                style={styles.video}
                resizeMode="cover"
              />
              <View style={styles.playOverlay}>
                <Image
                  source={require('../../assets/imagensEco/playIcon.png')}
                  style={styles.playIcon}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Carrossel fixo fora da rolagem */}
        <View style={styles.carouselWrapper}>
          <Carousel
            loop
            width={width} // ocupa toda a largura da tela
            height={70}
            autoPlay
            scrollAnimationDuration={4000}
            data={frases}
            renderItem={({ item }) => (
              <View style={styles.carouselItem}>
                <Text style={styles.carouselText}>{item.texto}</Text>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.cinzaClaro ?? '#f4f4f4',
  },
  wrapper: {
    flex: 1,
    justifyContent: 'space-between',
  },
 container: {
  flexGrow: 1,
  alignItems: 'center',
  paddingVertical: spacing.lg,
  paddingHorizontal: spacing.sm, // garante margem lateral em telas pequenas
  backgroundColor: colors.cinzaClaro ?? '#f4f4f4',
},

card: {
  backgroundColor: colors.branco,
  borderRadius: 16,
  width: '100%',
  maxWidth: 700,
  padding: spacing.sm,
  alignItems: 'center',
  elevation: 2,
},

  logo: {
    width: 100,
    height: 100,
    marginBottom: spacing.sm,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fonts.size.md,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xs,
  },
  thumbWrapper: {
    width: '90%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playIcon: {
    width: 100,
    height: 100,
    tintColor: 'white',
  },
  carouselWrapper: {
    paddingVertical: spacing.md,
  },
  carouselItem: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.md,
  },
  carouselText: {
    fontSize: fonts.size.sm,
    color: colors.verde,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
