import React from 'react';
import InputField from '../InputField';
import { Masks } from 'react-native-mask-input';

export default function FormLogin({
  cpf,
  senha,
  erros,
  handleChange,
  mostrarSenha,
  setMostrarSenha,
}) {
  return (
    <>
      <InputField
        label="CPF ou CNPJ"
        value={cpf}
        onChangeText={(v) => handleChange('cpf', v)}
        keyboardType="numeric"
        mask={(value) => {
          const digits = value.replace(/\D/g, '');
          return digits.length <= 11 ? Masks.BRL_CPF : Masks.BRL_CNPJ;
        }}
        error={erros.cpf}
        autoCapitalize="none"
      />

      <InputField
        label="Senha"
        value={senha}
        onChangeText={(v) => handleChange('senha', v)}
        secureTextEntry={!mostrarSenha}
        mostrarSenha={mostrarSenha}
        alternarSenha={() => setMostrarSenha(!mostrarSenha)}
        error={erros.senha}
        autoCapitalize="none"
      />
    </>
  );
}
