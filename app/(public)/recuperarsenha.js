import { useState,useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import ModalErro from '../../components/ModalErro'; 
import { useRouter } from 'expo-router';
import apiMock from '../../services/apiMock';
import FormRecuperarSenha from '../../components/forms/FormRecuperarSenha';
import ModalSucesso from '../../components/ModalSucesso';
import InputField from '../../components/InputField';
import BotaoVerde from '../../components/BotaoVerde';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { Masks } from 'react-native-mask-input';

const { width } = Dimensions.get('window');

export default function RecuperarSenha() {
  const router = useRouter();
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [modalNovaSenha, setModalNovaSenha] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState({ cpf: '', email: '' });
  const [erros, setErros] = useState({});
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [errosSenha, setErrosSenha] = useState({});
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [maskDocumento, setMaskDocumento] = useState(Masks.BRL_CPF);

    useEffect(() => {
      const numeros = dados.cpf.replace(/\D/g, '');
      if (numeros.length > 11 && maskDocumento !== Masks.BRL_CNPJ) {
        setMaskDocumento(Masks.BRL_CNPJ);
        console.log('Aplicando máscara: CNPJ');
      } else if (numeros.length <= 11 && maskDocumento !== Masks.BRL_CPF) {
        setMaskDocumento(Masks.BRL_CPF);
        console.log('Aplicando máscara: CPF');
      }
    }, [dados.cpf]);


  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => ({ ...prev, [campo]: null }));
  };

const handleDocumentoChange = (campo, valor) => {
  handleChange(campo, valor);

  const somenteNumeros = valor.replace(/\D/g, '');

if (campo === 'cpf') {
  const novaMascara =
    somenteNumeros.length > 11 ? Masks.BRL_CNPJ : Masks.BRL_CPF;

  setMaskDocumento(novaMascara);
  console.log('Máscara aplicada:', novaMascara === Masks.BRL_CNPJ ? 'CNPJ' : 'CPF');
}

};

 const handleRecuperar = async () => {
  if (carregando) return;
  setTentouEnviar(true);

  const apenasNumeros = dados.cpf.replace(/\D/g, '');
  const tipoDetectado = apenasNumeros.length > 11 ? 'pj' : 'pf';

  const campos = tipoDetectado === 'pj' ? ['cnpj', 'email'] : ['cpf', 'email'];
  const dadosValidacao = {
    email: dados.email,
    ...(tipoDetectado === 'pj' ? { cnpj: dados.cpf } : { cpf: dados.cpf }),
  };

  const novoErros = validarCamposObrigatorios(dadosValidacao, campos, tipoDetectado);
  setErros(novoErros);

  if (Object.keys(novoErros).length > 0) return;

  setCarregando(true);
  try {
    await apiMock.recuperarSenha({
      email: dados.email,
      cpf: tipoDetectado === 'pf' ? dados.cpf : undefined,
      cnpj: tipoDetectado === 'pj' ? dados.cpf : undefined,
    });

    setModalNovaSenha(true);
  } catch (error) {
    console.error(error);
    setMensagemErro(error?.message || 'Erro ao recuperar senha.');
    setErroVisivel(true);
  } finally {
    setCarregando(false);
  }
};


  const handleSalvarNovaSenha = async () => {
    if (carregando) return; 
    const campos = ['senha', 'confirmarSenha'];
    const errosValidacao = validarCamposObrigatorios(
      { senha: novaSenha, confirmarSenha },
      campos,
      null
    );

    setErrosSenha(errosValidacao);

    if (Object.keys(errosValidacao).length > 0) return;

    setCarregando(true);
    try {
      await apiMock.redefinirSenha({ ...dados, novaSenha });
      setModalNovaSenha(false);
      setModalSucesso(true);
    } catch (error) {
      console.error(error);
      setMensagemErro(error?.response?.data?.message || 'Erro ao redefinir senha.');
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

return (
<>
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.contentBox}>
        <Text style={styles.titulo}>Recuperar senha</Text>
        <Text style={styles.subtitulo}>Preencha CPF/CNPJ e e-mail para continuar</Text>

      <FormRecuperarSenha
        dados={dados}
        handleChange={handleDocumentoChange} 
        erros={erros}
        onSubmit={handleRecuperar}
        carregando={carregando}
        tentouEnviar={tentouEnviar}
        maskDocumento={maskDocumento}
      />
      </View>

    </ScrollView>

    <Modal visible={modalNovaSenha} transparent animationType="slide">
      <KeyboardAvoidingView
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.modalBox}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.modalTitulo}>Defina sua nova senha</Text>

          <InputField
            label="Nova senha"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry={!mostrarSenha}
            mostrarSenha={mostrarSenha}
            alternarSenha={() => setMostrarSenha(!mostrarSenha)}
            error={errosSenha.senha}
          />

          <InputField
            label="Confirmar senha"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry={!mostrarConfirmarSenha}
            mostrarSenha={mostrarConfirmarSenha}
            alternarSenha={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
            error={errosSenha.confirmarSenha}
          />

          <BotaoVerde texto="SALVAR" onPress={handleSalvarNovaSenha} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>

    <ModalSucesso
      visivel={modalSucesso}
      mensagem="Senha redefinida com sucesso!"
      botaoTexto="Voltar ao Login"
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
  </>
);
}

const styles = StyleSheet.create({
  scrollContainer: {
    minHeight: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
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
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    width:'100%'
  },
  modalBox: {
    backgroundColor: colors.branco,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalTitulo: {
    fontSize: fonts.size.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
});

