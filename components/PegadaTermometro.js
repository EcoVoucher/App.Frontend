import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function PegadaTermometro({ pontuacao }) {
  const faixas = [
    { label: '✅ Sustentável (até 1.6 gha)', limite: 160, cor: '#2E7D32' },
    { label: '🟢 Abaixo da média (~2.7 gha)', limite: 270, cor: '#66BB6A' },
    { label: '🟠 Média brasileira (~3.0 gha)', limite: 400, cor: '#FFB74D' },
    { label: '🟡 Alta (~4.6–6.0 gha)', limite: 600, cor: '#FFD54F' },
    { label: '🔵 Muito alta (~6.0 gha)', limite: 800, cor: '#64B5F6' },
    { label: '🔴 Extremamente alta (~8.0 gha)', limite: Infinity, cor: '#EF5350' },
  ];

  const faixaAtual = faixas.find(f => pontuacao <= f.limite);

  return (
    <View style={styles.termometroBox}>
      <Text style={styles.termometroTitulo}>Sua Pegada Atual</Text>

      <View style={styles.faixaContainer}>
        {faixas.map((f, i) => (
          <View
            key={i}
            style={[
              styles.faixa,
              { backgroundColor: f.cor },
              f.limite === faixaAtual.limite && styles.faixaAtiva,
            ]}
          />
        ))}
      </View>

      <Text style={styles.pontuacaoTexto}>
        {pontuacao} pontos – {faixaAtual.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  termometroBox: {
    marginBottom: spacing.lg,
    backgroundColor: colors.branco,
    padding: spacing.md,
    borderRadius: 12,
    elevation: 3,
    alignItems: 'center',
  },
  termometroTitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.sm,
  },
  faixaContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 20,
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  faixa: {
    flex: 1,
    opacity: 0.3,
  },
  faixaAtiva: {
    opacity: 1,
    borderWidth: 1.5,
    borderColor: colors.preto,
  },
  pontuacaoTexto: {
    fontSize: fonts.size.sm,
    color: colors.preto,
    textAlign: 'center',
  },
});
