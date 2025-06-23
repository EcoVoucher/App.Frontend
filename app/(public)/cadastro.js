import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalErro from '../../components/ModalErro';
import BotaoVerde from '../../components/BotaoVerde';
import FormCadastro from '../../components/forms/FormCadastro';
//import apiMock from '../../services/apiMock'; //substituir pela api.js
// 🔥 Importe assim quando usar API real:
import { cadastrarPF, cadastrarPJ } from '../../services/usuarioService';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { formatarCadastro } from '../../utils/formatarenvio';
import ModalSucesso from '../../components/ModalSucesso';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
const { width } = Dimensions.get('window');

const ESTADO_INICIAL = {
  nome: '',
  dataNascimento: '',
  cpf: '',
  telefone: '',
  cep: '',
  endereco: '',
  bairro: '',
  cidade: '',
  estado: '',
  numero: '',
  complemento: '',
  nomeEmpresa: '',
  cnpj: '',
  email: '',
  senha: '',
  confirmarSenha: ''
};

export default function Cadastro() {
  const router = useRouter();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [tipoPessoa, setTipoPessoa] = useState(null);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const [modalTipoVisivel, setModalTipoVisivel] = useState(true);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [erros, setErros] = useState({});
  const [dados, setDados] = useState(ESTADO_INICIAL);
  const [carregando, setCarregando] = useState(false);

  const handleChange = (campo, valor) => {
     if (carregando) return; // 
    setDados((prev) => {
      const novosDados = { ...prev, [campo]: valor };

      if (campo === 'cep') {
        const cepLimpo = valor.replace(/\D/g, '');
        novosDados.endereco = '';
        novosDados.bairro = '';
        novosDados.cidade = '';
        novosDados.estado = '';

        if (cepLimpo.length === 8) {
          buscarEndereco(cepLimpo);
        }
      }

      return novosDados;
    });

    setErros((prev) => {
      const novosErros = { ...prev };
      if (valor.trim()) delete novosErros[campo];
      return novosErros;
    });
  };

  const buscarEndereco = async (cep) => {
    try {
      // Adicionar timeout de segurança para evitar travamento em caso de rede lenta
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`http://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });

      console.log(cep)
      const data = await res.json();
      if (data.erro) {
        setMensagemErro('CEP inválido. Verifique e tente novamente.');
      setErroVisivel(true);
      ;
        return;
      }
      setDados((prev) => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || ''
      }));
    } catch(e) {
      setMensagemErro('Erro ao buscar endereço. Tente novamente mais tarde.');
      setErroVisivel(true);
      console.log(e)

    }
  };

  const camposPreenchidos = () => {
    const obrigatorios = tipoPessoa === 'pf'
      ? ['nome', 'dataNascimento', 'cpf']
      : ['nomeEmpresa', 'cnpj'];

    const comuns = [
      'telefone',
      'cep',
      'endereco',
      'bairro',
      'cidade',
      'estado',
      'numero',
      'email',
      'senha',
      'confirmarSenha'
    ];

    return [...obrigatorios, ...comuns].every((campo) => dados[campo]?.trim());
  };

  const validarCampos = () => {
    const campos = tipoPessoa === 'pf'
      ? [
          'nome', 'dataNascimento', 'cpf', 'telefone', 'cep', 'endereco',
          'bairro', 'cidade', 'estado', 'numero', 'email', 'senha', 'confirmarSenha'
        ]
      : [
          'nomeEmpresa', 'cnpj', 'telefone', 'cep', 'endereco', 'bairro',
          'cidade', 'estado', 'numero', 'email', 'senha', 'confirmarSenha'
        ];

    const novoErros = validarCamposObrigatorios(dados, campos, tipoPessoa);
    setErros(novoErros);
    return Object.keys(novoErros).length === 0;
  };

const handleCadastro = async () => {
  if (carregando) return;
  if (!validarCampos()) return;

  setCarregando(true);
  try {
    const dadosFormatados = formatarCadastro(dados);

    // ✅ === ATIVAR PARA API REAL ===
  
    if (tipoPessoa === 'pf') {
      await cadastrarPF(dadosFormatados); // ← Importar de usuarioService.js
    } else {
      await cadastrarPJ(dadosFormatados); // ← Importar de usuarioService.js
    }
  

    setModalSucesso(true);
 } catch (error) {
  console.error(error);
  let mensagem = error?.message || 'Não foi possível realizar o cadastro.';

  if (error.response) {
    const status = error.response.status;

    if (status === 400) {
      mensagem = 'Preencha todos os campos obrigatórios.';
    } else if (status === 409) {
      mensagem = 'CPF ou CNPJ já cadastrado.';
    } else if (status === 422) {
      mensagem = 'Dados inválidos. Verifique e tente novamente.';
    } else {
      mensagem = obterMensagemErro(error, mensagem);
    }
  } else {
    mensagem = obterMensagemErro(error, mensagem);
  }

  setMensagemErro(mensagem);
  setErroVisivel(true);

  // ✅ Reset específico — aqui é seguro manter
  if (mensagem.includes('CNPJ')) {
    setDados(ESTADO_INICIAL);
    setErros({});
  }
}
 finally {
    setCarregando(false);
  }
};

  const limparCampos = () => {
    setDados(ESTADO_INICIAL);
    setErros({});
    setTipoPessoa(null);
    setModalTipoVisivel(true);
  };

 return (
  <>
    <View style={styles.contentBox}>
      {tipoPessoa && (
        <TouchableOpacity onPress={limparCampos}>
          <Text style={styles.voltar}>← Voltar ao tipo de cadastro</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.titulo}>Cadastro</Text>
      <Text style={styles.subtitulo}>Preencha seus dados abaixo</Text>

      {tipoPessoa && (
        <FormCadastro
          dados={dados}
          handleChange={handleChange}
          erros={erros}
          tipoPessoa={tipoPessoa}
          onSubmit={handleCadastro}
          desabilitado={!camposPreenchidos()}
          mostrarSenha={mostrarSenha}
          setMostrarSenha={setMostrarSenha}
          mostrarConfirmarSenha={mostrarConfirmarSenha}
          setMostrarConfirmarSenha={setMostrarConfirmarSenha}
          carregando={carregando}
        />
      )}

      <Text style={styles.rodape}>© 2025 EcoVoucher</Text>
    </View>

    {/* Modal escolha tipo */}
    <Modal visible={modalTipoVisivel} transparent animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalBox}>
          <Text style={styles.modalTitulo}>Escolha o tipo de cadastro</Text>
          <View style={{ gap: spacing.sm, width: '100%' }}>
            <BotaoVerde texto="Pessoa Física" onPress={() => { setTipoPessoa('pf'); setModalTipoVisivel(false); }} />
            <BotaoVerde texto="Pessoa Jurídica" onPress={() => { setTipoPessoa('pj'); setModalTipoVisivel(false); }} />
          </View>
        </View>
      </View>
    </Modal>

<ModalSucesso
  visivel={modalSucesso}
  exibirBotao={false}
  titulo="Cadastro realizado com sucesso!"
  mensagem={
    tipoPessoa === 'pj' 
      ? (
        <>
          <Text style={{ textAlign: 'center', marginBottom: 8 }}>
            Aguarde a aprovação do administrador. Entraremos em contato.
          </Text>
          <BotaoVerde
            texto="Concluir"
            onPress={() => {
              setModalSucesso(false);
              setDados(ESTADO_INICIAL);
              setErros({});
              setTipoPessoa('pj');
              setModalTipoVisivel(false);
            }}
          />
        </>
      )
      : (
        <>
          <Text style={{ textAlign: 'center', marginBottom: 8 }}>
            Seu cadastro foi realizado com sucesso.
          </Text>
          <BotaoVerde
            texto="Ir para Login"
            onPress={() => {
              setModalSucesso(false);
              setDados(ESTADO_INICIAL);
              setErros({});
              setTipoPessoa(null);
              router.replace('/(public)/login');
            }}
          />
        </>
      )
  }
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
   contentBox: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xxl,
  },
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  voltar: {
    fontSize: fonts.size.sm,
    color: colors.verde,
    marginBottom: spacing.md,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
  rodape: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    backgroundColor: colors.branco,
    padding: spacing.lg,
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitulo: {
    fontSize: fonts.size.md,
    marginBottom: spacing.sm,
    textAlign: 'center',
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
});
