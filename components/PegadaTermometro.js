import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import { obterFaixasPegada } from '../utils/formatadores';

export default function PegadaTermometro({ pontuacao }) {
  const faixas = obterFaixasPegada();
  const faixaAtual = faixas.find(f => pontuacao <= f.limite) || faixas[faixas.length - 1];

  // 🔥 Definir a altura das faixas conforme o impacto (mais alta se a pegada é pior)
  const getAltura = (limite) => {
    if (limite <= 160) return 12;
    if (limite <= 270) return 14;
    if (limite <= 300) return 16;
    if (limite <= 460) return 18;
    if (limite <= 600) return 20;
    return 24; // 🔴 Extremamente alta
  };

  return (
    <View style={styles.termometroBox}>
      <Text style={styles.termometroTitulo}>🌎 Sua Pegada Atual</Text>

      <View style={styles.faixaContainer}>
        {faixas.map((f, i) => (
          <View
            key={i}
            style={[
              styles.faixa,
              {
                backgroundColor: f.cor,
                height: getAltura(f.limite),
              },
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
    elevation: 2,
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
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2,
  },
  faixa: {
    flex: 1,
    opacity: 1,
    borderRadius: 8,
  },
  faixaAtiva: {
    borderWidth: 2,
    borderColor: colors.preto,
  },
  pontuacaoTexto: {
    fontSize: fonts.size.sm,
    color: colors.preto,
    textAlign: 'center',
    marginTop: 4,
  },
});
