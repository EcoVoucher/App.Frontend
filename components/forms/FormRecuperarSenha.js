import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import InputField from '../InputField';
import BotaoVerde from '../BotaoVerde';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { Masks } from 'react-native-mask-input';

export default function FormRecuperarSenha({
  dados,
  handleChange,
  erros,
  onSubmit,
  carregando,
  tentouEnviar
}) {
  const maskDocumento = (valor) => {
    const digitos = valor.replace(/\D/g, '');
    return digitos.length <= 11 ? Masks.BRL_CPF : Masks.BRL_CNPJ;
  };

  return (
    <>
      <InputField
        label="CPF ou CNPJ"
        value={dados.cpf}
        onChangeText={(v) => handleChange('cpf', v)}
        mask={maskDocumento}
        keyboardType="numeric"
        error={erros.cpf}
      />
      <InputField
        label="E-mail"
        value={dados.email}
        onChangeText={(v) => handleChange('email', v)}
        keyboardType="email-address"
        error={erros.email}
      />

      {tentouEnviar && Object.keys(erros).length > 0 && (
        <Text style={styles.erroAviso}>Corrija os campos destacados para continuar</Text>
      )}

      <View style={styles.botaoBox}>
        {carregando ? (
          <ActivityIndicator size="large" color={colors.verde} />
        ) : (
          <BotaoVerde texto="RECUPERAR SENHA" onPress={onSubmit} disabled={carregando || Object.keys(erros).length > 0}
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
