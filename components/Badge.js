import { Text, View, StyleSheet } from 'react-native';
import { corStatus, textoStatus } from '../utils/status'; // 🔗 Importando do status.js
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import { colors } from '../theme/colors';



export default function BadgeStatus({ status }) {
  const corFundo = corStatus[status] ?? corStatus.indefinido;
  const texto = textoStatus[status] ?? 'Indefinido';

  return (
    <View style={[styles.badge, { backgroundColor: corFundo }]}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  texto: {
    color: colors.branco,
    fontSize: fonts.size.xs,
    fontWeight: 'bold',
  },
});
