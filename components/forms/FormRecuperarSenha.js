import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import InputField from '../InputField';
import BotaoVerde from '../BotaoVerde';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function FormRecuperarSenha({
  dados,
  tipoPessoa,
  handleChange,
  erros,
  onSubmit,
  carregando,
  tentouEnviar,
  maskDocumento,
}) {
  return (
    <>
      <InputField
        label={tipoPessoa === 'pj' ? 'CNPJ' : 'CPF'}
        value={dados.cpf}
        onChangeText={(valor) => handleChange('cpf', valor)}
        keyboardType="numeric"
        mask={maskDocumento}
        error={tipoPessoa === 'pj' ? erros?.cnpj : erros?.cpf}
      />
      
      {tentouEnviar && erros && Object.keys(erros).length > 0 && (
        <Text style={styles.erroAviso}>
          Corrija os campos destacados para continuar
        </Text>
      )}

      <View style={styles.botaoBox}>
        {carregando ? (
          <ActivityIndicator size="large" color={colors.verde} />
        ) : (
          <BotaoVerde
            texto="RECUPERAR SENHA"
            onPress={onSubmit}
            disabled={carregando || Object.keys(erros).length > 0}
          />
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  erroAviso: {
    color: colors.erro,
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  botaoBox: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
