import {
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function AnimatedCard({ imagem, rota, label }) {
  const router = useRouter();
  const scale = new Animated.Value(1);
  const { width } = useWindowDimensions();

  const isLargeScreen = width > 500;
  const cardSize = isLargeScreen ? 120 : 90;
  const iconSize = isLargeScreen ? 80 : 60;

  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginHorizontal: spacing.xs,
      marginBottom: spacing.md,
    },
    card: {
      width: cardSize,
      height: cardSize,
      borderRadius: 16,
      backgroundColor: colors.branco,
      borderColor: colors.cinza,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowOffset: { width: 0, height: 3 },
      shadowRadius: 5,
      elevation: 3,
    },
    touch: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 16,
      padding: spacing.sm,
    },
    icone: {
      width: iconSize,
      height: iconSize,
      resizeMode: 'contain',
      borderRadius: 10,
    },
    label: {
      marginTop: spacing.xs,
      fontSize: fonts.size.sm,
      fontWeight: 'bold',
      color: colors.verde,
      textAlign: 'center',
    },
  });

  const animar = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => router.push(rota));
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.card, { transform: [{ scale }] }]}>
        <TouchableOpacity onPress={animar} activeOpacity={0.85} style={styles.touch}>
          <Image source={imagem} style={styles.icone} />
        </TouchableOpacity>
      </Animated.View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}
