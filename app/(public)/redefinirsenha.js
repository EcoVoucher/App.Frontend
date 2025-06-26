import { useState,useEffect } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { AuthService } from '../../services/authService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import InputField from '../../components/InputField';
import BotaoVerde from '../../components/BotaoVerde';
import ModalSucesso from '../../components/ModalSucesso';
import ModalErro from '../../components/ModalErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

export default function RedefinirSenha() {
  const router = useRouter();
  const { token } = useLocalSearchParams(); // 🔄 No futuro virá por link de email da API real

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erros, setErros] = useState({});
  const [modalSucesso, setModalSucesso] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  
  // 🔄 FUTURO: validação do token com API real
  useEffect(() => {
  const verificarToken = async () => {
    try {
      const resposta = await AuthService.validarToken(token);
      if (!resposta?.valido) {
        throw new Error(resposta?.erro || 'Token inválido ou expirado.');
      }
   } catch (error) {
  const mensagem = obterMensagemErro(error, 'Ocorreu um erro. Tente novamente.');
  setMensagemErro(mensagem);
  setErroVisivel(true);
}
  };

  verificarToken();
}, [token]);


  const handleSalvar = async () => {
   const campos = ['novaSenha', 'confirmarSenha'];
  const dadosValidacao = {
  novaSenha,
  confirmarSenha,
};


    const errosValidados = validarCamposObrigatorios(dadosValidacao, campos);
    setErros(errosValidados);
    if (Object.keys(errosValidados).length > 0) return;

    setCarregando(true);
    try {
      await AuthService.redefinirSenha({ token, senha: novaSenha });

      setModalSucesso(true);
    } catch (error) {
      setMensagemErro(obterMensagemErro(error, 'Erro ao redefinir senha.'));
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.contentBox}
      >
        <Text style={styles.titulo}>Redefinir Senha</Text>
        <Text style={styles.subtitulo}>Digite sua nova senha abaixo</Text>

        <InputField
          label="Nova senha"
          
          value={novaSenha}
          onChangeText={setNovaSenha}
          secureTextEntry={!mostrarSenha}
          mostrarSenha={mostrarSenha}
          alternarSenha={() => setMostrarSenha(!mostrarSenha)}
           error={erros.novaSenha}
        />

        <InputField
          label="Confirmar nova senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarConfirmar}
          mostrarSenha={mostrarConfirmar}
          alternarSenha={() => setMostrarConfirmar(!mostrarConfirmar)}
          error={erros.confirmarSenha}
        />

        <BotaoVerde
          texto="Salvar nova senha"
          onPress={handleSalvar}
          carregando={carregando}
        />
      </KeyboardAvoidingView>

      <ModalSucesso
        visivel={modalSucesso}
        mensagem="Senha redefinida com sucesso!"
        botaoTexto="Voltar ao login"
        onFechar={() => {
          setModalSucesso(false);
          router.replace('/(public)/login');
        }}
      />

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    backgroundColor: colors.fundoClaro,
  },
  contentBox: {
    width: '100%',
    maxWidth: 500,
    paddingHorizontal: spacing.md,
  },
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  erroBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  erroTexto: {
    color: colors.vermelho,
    fontSize: fonts.size.md,
    textAlign: 'center',
  },
});
