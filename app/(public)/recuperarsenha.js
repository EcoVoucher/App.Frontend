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
import InputField from '../../components/InputField';

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
  const [codigo, setCodigo] = useState('');
  const [erroCodigo, setErroCodigo] = useState('');
  const [validandoCodigo, setValidandoCodigo] = useState(false);

  

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
   cpfOuCnpj: dados.cpf, 
});

if (resposta?.sucesso) {
  setModalSucessoVisivel(true); 
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
    onFechar={() => {
      setCodigo('');
      setErroCodigo('');
      setModalSucessoVisivel(false);
    }}
  exibirBotao={false}
  mensagem={
    <View style={{ width: '100%', alignItems: 'center' }}>
      <Text style={{ textAlign: 'center', marginBottom: 12 }}>
        Enviamos um código para seu e-mail. Digite abaixo para continuar:
      </Text>

      <InputField
            placeholder="Código recebido"
            value={codigo}
            onChangeText={(val) => {
              setCodigo(val);
              setErroCodigo('');
            }}
            error={erroCodigo}
            containerStyle={{
              width: '100%',
              maxWidth: 280,
              alignSelf: 'center',
              marginBottom: spacing.sm,
            }}
          />
      <TouchableOpacity
       disabled={validandoCodigo}
        onPress={async () => {
          if (!codigo || codigo.length < 4) {
            setErroCodigo('Código inválido.');
            return;
          }
            try {
              setValidandoCodigo(true);
              const resposta = await AuthService.validarToken(codigo);

              if (resposta?.valido) {
                setModalSucessoVisivel(false);
                router.replace({
                  pathname: '/(public)/redefinirsenha',
                  params: { token: codigo },
                });
              } else {
                setErroCodigo('Código inválido ou expirado.');
              }
            } catch (error) {
              console.error(error);
              setMensagemErro(obterMensagemErro(error,'Erro ao validar o código.'));
              setErroVisivel(true);
            }


          }}
        style={{

          backgroundColor: colors.verde,
          paddingVertical: spacing.sm,
          paddingHorizontal: spacing.xl,
          borderRadius: 12,
          marginTop: spacing.sm,
        }}
        
      >
    <Text style={{ color: colors.branco, fontWeight: 'bold' }}>OK</Text>
      </TouchableOpacity>

      {/* Botão Cancelar */}
      <TouchableOpacity
        onPress={() => {
              setCodigo('');
              setErroCodigo('');
              setModalSucessoVisivel(false);
            }}
        style={{
          paddingVertical: spacing.sm,
          marginTop: spacing.sm,
        }}
      >
        <Text style={{ color: colors.erro, fontWeight: 'bold' }}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  }
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
