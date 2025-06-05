import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function BotaoVerdePequeno({ texto, onPress, ativo }) {
  return (
    <TouchableOpacity
      style={[styles.botao, ativo ? styles.ativo : styles.inativo]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <Text style={[styles.texto, ativo ? styles.textoAtivo : styles.textoInativo]}>
        {texto}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  botao: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    marginHorizontal: spacing.xs,
    borderWidth: 1.5,
    minHeight: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ativo: {
    backgroundColor: colors.verde,
    borderColor: colors.verde,
  },
  inativo: {
    backgroundColor: colors.branco,
    borderColor: colors.verde,
  },
  texto: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
  },
  textoAtivo: {
    color: colors.branco,
  },
  textoInativo: {
    color: colors.verde,
  },
});
