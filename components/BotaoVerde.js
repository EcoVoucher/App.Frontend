import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function BotaoVerde({ texto, onPress, style = {}, textoStyle = {} }) {
  return (
    <TouchableOpacity
      style={[styles.botao, style]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.texto, textoStyle]}>{texto}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    backgroundColor: colors.verde,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.sm,
    minWidth: 160,
    minHeight: 48,
    alignSelf: 'center',
  },
  texto: {
    color: colors.branco,
    fontWeight: fonts.weight.bold,
    fontSize: fonts.size.md,
  },
});
