import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';


export default function Badge({ texto, corFundo = colors.verde }) {
  return (
    <View style={[styles.badge, { backgroundColor: corFundo }]}>
      <Text style={styles.texto}>{texto}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  texto: {
    color: colors.branco,
    fontSize: fonts.size.xs,
    fontWeight: 'bold',
  },
});
