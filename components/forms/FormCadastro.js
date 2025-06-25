import InputField from '../InputField';
import { Masks } from 'react-native-mask-input';
import BotaoVerde from '../BotaoVerde';
import { Text, ActivityIndicator, StyleSheet, View, Dimensions } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const { width } = Dimensions.get('window');

export default function FormCadastro({
  dados,
  handleChange,
  erros,
  tipoPessoa,
  onSubmit,
  desabilitado,
  carregando,
  mostrarSenha,
  mostrarConfirmarSenha,
  setMostrarSenha,
  setMostrarConfirmarSenha,
  camposBloqueados,
}) {
  return (
    <View style={styles.formWrapper}>
      {tipoPessoa === 'pf' && (
        <>
          <InputField
            label="Nome completo"
            value={dados.nome}
            onChangeText={(v) => handleChange('nome', v)}
            error={erros.nome}
            
          />
          <InputField
            label="Data de nascimento"
            value={dados.dataNascimento}
            onChangeText={(v) => handleChange('dataNascimento', v)}
            mask={Masks.DATE_DDMMYYYY}
            keyboardType="numeric"
            error={erros.dataNascimento}
          />
          <InputField
            label="CPF"
            value={dados.cpf}
            onChangeText={(v) => handleChange('cpf', v)}
            mask={Masks.BRL_CPF}
            keyboardType="numeric"
            error={erros.cpf}
          />
        </>
      )}

      {tipoPessoa === 'pj' && (
        <>
          <InputField
            label="Nome da empresa"
            value={dados.nomeEmpresa}
            onChangeText={(v) => handleChange('nomeEmpresa', v)}
            error={erros.nomeEmpresa}
          />
          <InputField
            label="CNPJ"
            value={dados.cnpj}
            onChangeText={(v) => handleChange('cnpj', v)}
            mask={Masks.BRL_CNPJ}
            keyboardType="numeric"
            error={erros.cnpj}
          />
        </>
      )}

      {tipoPessoa && (
        <>
          <InputField
            label="Telefone"
            value={dados.telefone}
            onChangeText={(v) => handleChange('telefone', v)}
            mask={Masks.BRL_PHONE}
            keyboardType="phone-pad"
            error={erros.telefone}
          />
          <InputField
            label="CEP"
            value={dados.cep}
            onChangeText={(v) => handleChange('cep', v)}
            mask={Masks.ZIP_CODE}
            keyboardType="numeric"
            error={erros.cep}
          />
         <InputField
            label="Endereço"
            value={dados.endereco}
            onChangeText={(texto) => handleChange('endereco', texto.toUpperCase())}
            error={erros.endereco}
            editable={!camposBloqueados}
            style={camposBloqueados ? { backgroundColor: '#f0f0f0' } : {}}
          />

          <InputField
            label="Bairro"
            value={dados.bairro}
            onChangeText={(texto) => handleChange('bairro', texto.toUpperCase())}
            error={erros.bairro}
            editable={!camposBloqueados}
            style={camposBloqueados ? { backgroundColor: '#f0f0f0' } : {}}
          />

          <InputField
            label="Cidade"
            value={dados.cidade}
            onChangeText={(texto) => handleChange('cidade', texto.toUpperCase())}
            error={erros.cidade}
            editable={!camposBloqueados}
            style={camposBloqueados ? { backgroundColor: '#f0f0f0' } : {}}
          />

          <InputField
            label="Estado"
            value={dados.estado}
            onChangeText={(texto) => handleChange('estado', texto.toUpperCase())}
            error={erros.estado}
            editable={!camposBloqueados}
            style={camposBloqueados ? { backgroundColor: '#f0f0f0' } : {}}
          />

          <InputField
            label="Número"
            value={dados.numero}
            onChangeText={(v) => handleChange('numero', v)}
            error={erros.numero}
          />
          <InputField
            label="Complemento"
            value={dados.complemento}
            onChangeText={(v) => handleChange('complemento', v)}
          />
          <InputField
            label="Email"
            value={dados.email}
            onChangeText={(v) => handleChange('email', v)}
            keyboardType="email-address"
            error={erros.email}
          />
          <InputField
            label="Senha"
            value={dados.senha}
            onChangeText={(v) => handleChange('senha', v)}
            secureTextEntry={!mostrarSenha}
            mostrarSenha={mostrarSenha}
            alternarSenha={() => setMostrarSenha(!mostrarSenha)}
            error={erros.senha}
          />
          <InputField
            label="Confirmar senha"
            value={dados.confirmarSenha}
            onChangeText={(v) => handleChange('confirmarSenha', v)}
            secureTextEntry={!mostrarConfirmarSenha}
            mostrarSenha={mostrarConfirmarSenha}
            alternarSenha={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            error={erros.confirmarSenha}
          />

          {Object.keys(erros).length > 0 && (
            <Text style={styles.erroGlobal}>
              Corrija os campos destacados para continuar
            </Text>
          )}

          {carregando ? (
            <ActivityIndicator size="large" color={colors.verde} style={{ marginTop: 8 }} />
          ) : (
            <BotaoVerde texto="CADASTRAR" onPress={onSubmit} disabled={desabilitado} />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
   formWrapper: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
  },
  erroGlobal: {
    color: colors.erro,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});