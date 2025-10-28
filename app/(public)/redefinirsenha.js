import { useState, useEffect } from 'react';
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
  const { token } = useLocalSearchParams(); // vindo do link/rota

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [erros, setErros] = useState({});
  const [modalSucesso, setModalSucesso] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  // valida o token ao montar a tela
  useEffect(() => {
    (async () => {
      const t = String(token ?? '').trim();
      if (!t) {
        setMensagemErro('Link inválido. Solicite uma nova recuperação de senha.');
        setErroVisivel(true);
        return;
      }
      try {
        const resp = await AuthService.validarToken(t);
        if (!resp.ok) {
          setMensagemErro(
            obterMensagemErro(resp.error, 'Token inválido ou expirado.')
          );
          setErroVisivel(true);
        }
      } catch (error) {
        setMensagemErro(
          obterMensagemErro(error, 'Ocorreu um erro. Tente novamente.')
        );
        setErroVisivel(true);
      }
    })();
  }, [token]);

  const handleSalvar = async () => {
    const campos = ['novaSenha', 'confirmarSenha'];
    const dadosValidacao = { novaSenha, confirmarSenha };
    const errosValidados = validarCamposObrigatorios(dadosValidacao, campos);

    // garante que as senhas coincidam
    if ((novaSenha || '') !== (confirmarSenha || '')) {
      errosValidados.confirmarSenha = 'As senhas não coincidem.';
    }

    setErros(errosValidados);
    if (Object.keys(errosValidados).length > 0) return;

    setCarregando(true);
    try {
      const resp = await AuthService.redefinirSenha({
        token: String(token ?? '').trim(),
        senha: novaSenha,
      });

      if (!resp.ok) {
        setMensagemErro(
          obterMensagemErro(resp.error, 'Erro ao redefinir senha.')
        );
        setErroVisivel(true);
        return;
      }

      setModalSucesso(true);
    } catch (error) {
      setMensagemErro(
        obterMensagemErro(error, 'Erro ao redefinir senha.')
      );
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
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
          autoCapitalize="none"
          autoCorrect={false}
        />

        <InputField
          label="Confirmar nova senha"
          value={confirmarSenha}
          onChangeText={setConfirmarSenha}
          secureTextEntry={!mostrarConfirmar}
          mostrarSenha={mostrarConfirmar}
          alternarSenha={() => setMostrarConfirmar(!mostrarConfirmar)}
          error={erros.confirmarSenha}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <BotaoVerde
          texto={carregando ? 'Salvando...' : 'Salvar nova senha'}
          onPress={handleSalvar}
          carregando={carregando}
          disabled={carregando}
          style={{ marginTop: spacing.sm }}
        />
      </KeyboardAvoidingView>

      <ModalSucesso
        visivel={modalSucesso}
        mensagem="Senha redefinida com sucesso!"
        botaoTexto="Voltar ao login"
        onFechar={() => {
          setModalSucesso(false);
          router.replace('/login');
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
});
