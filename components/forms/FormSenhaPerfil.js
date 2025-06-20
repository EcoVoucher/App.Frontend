import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

import InputField from '../InputField';
import BotaoVerde from '../BotaoVerde';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

export default function FormSenhaPerfil({
  senhaAtual,
  setSenhaAtual,
  novaSenha,
  setNovaSenha,
  confirmarNovaSenha,
  setConfirmarNovaSenha,
  erros,
  mostrarSenhaAtual,
  setMostrarSenhaAtual,
  mostrarNovaSenha,
  setMostrarNovaSenha,
  mostrarConfirmar,
  setMostrarConfirmar,
  carregando,
  onSubmit,
}) {
  return (
    <View style={styles.formWrapper}>
      <InputField
        label="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry={!mostrarSenhaAtual}
        mostrarSenha={mostrarSenhaAtual}
        alternarSenha={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
        error={erros.senhaAtual}
        containerStyle={{ marginBottom: spacing.md }}
      />

      <InputField
        label="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry={!mostrarNovaSenha}
        mostrarSenha={mostrarNovaSenha}
        alternarSenha={() => setMostrarNovaSenha(!mostrarNovaSenha)}
        error={erros.novaSenha}
        containerStyle={{ marginBottom: spacing.md }}
      />

      <InputField
        label="Confirmar nova senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureTextEntry={!mostrarConfirmar}
        mostrarSenha={mostrarConfirmar}
        alternarSenha={() => setMostrarConfirmar(!mostrarConfirmar)}
        error={erros.confirmarSenha}
        containerStyle={{ marginBottom: spacing.md }}
      />

      {Object.keys(erros).length > 0 && (
        <Text style={styles.erroGlobal}>
          Corrija os campos destacados para continuar
        </Text>
      )}

      {carregando ? (
        <ActivityIndicator size="large" color={colors.verde} style={{ marginTop: 8 }} />
      ) : (
        <BotaoVerde texto="SALVAR NOVA SENHA" onPress={onSubmit} />
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
