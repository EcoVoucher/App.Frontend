import React from 'react';
import InputField from '../InputField';
import { Masks } from 'react-native-mask-input';

export default function FormLogin({
  cpf,
  senha,
  erros,
  tipoPessoa, 
  handleChange,
  mostrarSenha,
  setMostrarSenha,
}) {
  const mask = tipoPessoa === 'pj' ? Masks.BRL_CNPJ : Masks.BRL_CPF;

  return (
    <>
      <InputField
        label={tipoPessoa === 'pj' ? 'CNPJ' : 'CPF'}
        value={cpf}
        onChangeText={(v) => handleChange('cpf', v)}
        keyboardType="numeric"
        mask={mask}
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
