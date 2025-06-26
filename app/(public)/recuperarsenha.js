import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '../../services/authService';// ✅ Atualmente rodando no MOCK.
import { Masks } from 'react-native-mask-input';
import ModalErro from '../../components/ModalErro';
import ModalSucesso from '../../components/ModalSucesso'; 
import FormRecuperarSenha from '../../components/forms/FormRecuperarSenha';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

export default function RecuperarSenha() {
  const router = useRouter();
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [modalSucessoVisivel, setModalSucessoVisivel] = useState(false); // ✅ uso futuro
  const [carregando, setCarregando] = useState(false);
  const [dados, setDados] = useState({ cpf: '' });
  const [erros, setErros] = useState({});
  const [tipoPessoa, setTipoPessoa] = useState('pf');
  

  const maskDocumento = tipoPessoa === 'pf' ? Masks.BRL_CPF : Masks.BRL_CNPJ;

  const handleChange = (campo, valor) => {
    setDados((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => ({ ...prev, [campo]: null }));
  };

  const handleRecuperar = async () => {
    if (carregando) return;
    setTentouEnviar(true);

    //🔗 === Validação na API REAL (usar no futuro) ===
  const campos = ['cpfOuCnpj'];
  const dadosValidacao = {
    cpfOuCnpj: dados.cpf,
  };

    const novoErros = validarCamposObrigatorios(dadosValidacao, campos, tipoPessoa);
    setErros(novoErros);
    if (Object.keys(novoErros).length > 0) return;

    setCarregando(true);
    try {
    
//🔗 === MODO API REAL (ativar no futuro) ===
const resposta = await AuthService.recuperarSenha({
   cpfOuCnpj: dados.cpf, // ✅ API espera campo unificado
});

if (resposta?.sucesso) {
  setModalSucessoVisivel(true); // ✔️ Exibe que foi enviado para o e-mail
} else {
  throw new Error(resposta?.erro || 'Erro ao recuperar senha.');
}
    } catch (error) {
      console.error(error);
      setMensagemErro(obterMensagemErro(error,'Erro ao recuperar senha.'));
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
          <Text style={styles.subtitulo}>Preencha CPF/CNPJ para continuar</Text>

          <View style={styles.tipoBox}>
            <TouchableOpacity
              style={[styles.tipoBotao, tipoPessoa === 'pf' && styles.tipoSelecionado]}
              onPress={() => setTipoPessoa('pf')}
            >
              <Text style={[styles.tipoTexto, tipoPessoa === 'pf' && styles.tipoTextoSelecionado]}>
                Pessoa Física
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tipoBotao, tipoPessoa === 'pj' && styles.tipoSelecionado]}
              onPress={() => setTipoPessoa('pj')}
            >
              <Text style={[styles.tipoTexto, tipoPessoa === 'pj' && styles.tipoTextoSelecionado]}>
                Pessoa Jurídica
              </Text>
            </TouchableOpacity>
          </View>

          <FormRecuperarSenha
            dados={dados}
            handleChange={handleChange}
            erros={erros}
            onSubmit={handleRecuperar}
            carregando={carregando}
            tentouEnviar={tentouEnviar}
            maskDocumento={maskDocumento}
            tipoPessoa={tipoPessoa}
          />
        </View>
      </ScrollView>

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />

      {/* ✅ Modal de sucesso FUTURO (com API real) */}
      <ModalSucesso
        visivel={modalSucessoVisivel}
        mensagem="Enviamos as instruções para redefinir sua senha ao e-mail cadastrado. Verifique sua caixa de entrada!"
        onClose={() => {
          setModalSucessoVisivel(false);
          router.replace('/(public)/login');
        }}
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
  tipoBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
    gap: 12,
  },
  tipoBotao: {
    borderWidth: 1,
    borderColor: colors.verde,
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  tipoSelecionado: {
    backgroundColor: colors.verde,
  },
  tipoTexto: {
    color: colors.verde,
    fontWeight: 'bold',
  },
  tipoTextoSelecionado: {
    color: colors.branco,
  },
});
