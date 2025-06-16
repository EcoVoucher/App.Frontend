import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalErro from '../../components/ModalErro';
import BotaoVerde from '../../components/BotaoVerde';
import FormLogin from '../../components/forms/FormLogin';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';// import api from '../../services/api'; // 🔄 Substituir apiMock pela API real no futuro
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();

  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erros, setErros] = useState({});
  const [tipoPessoa, setTipoPessoa] = useState('pf');
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [tentativas, setTentativas] = useState(0);
  const [bloqueado, setBloqueado] = useState(false);


  const handleChange = (campo, valor) => {
    if (campo === 'cpf') setCpf(valor);
    if (campo === 'senha') setSenha(valor);

    setErros((prev) => {
      const novosErros = { ...prev };
      if (valor.trim()) delete novosErros[campo];
      return novosErros;
    });
  };

  const validarCampos = () => {
    const campos = ['cpf', 'senha'];
    const dados = { cpf, senha };
    const novoErros = validarCamposObrigatorios(dados, campos, tipoPessoa);
    setErros(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleLogin = async () => {
  if (carregando || bloqueado) return;

  if (!validarCampos()) {
    setMensagemErro('Por favor, preencha CPF/CNPJ e senha corretamente.');
    setErroVisivel(true);
    return;
  }

  const cpfOuCnpj = cpf.replace(/\D/g, '');

  if (tipoPessoa === 'pf' && cpfOuCnpj.length !== 11) {
    setMensagemErro('Você selecionou Pessoa Física, mas o CPF está inválido.');
    setErroVisivel(true);
    return;
  }

  if (tipoPessoa === 'pj' && cpfOuCnpj.length !== 14) {
    setMensagemErro('Você selecionou Pessoa Jurídica, mas o CNPJ está inválido.');
    setErroVisivel(true);
    return;
  }

  setCarregando(true);

  try {
    // 🔄 Quando for usar a API real, descomente a linha abaixo e comente a do mock
// const { token, usuario } = await api.login(cpfOuCnpj, senha, tipoPessoa);
    const { token, usuario } = await apiMock.login(cpfOuCnpj, senha, tipoPessoa); // ✅ uso atual com mock

    await login({ token, usuario });

    setTentativas(0); // limpa tentativas

    if (usuario.primeiroAcesso && usuario.tipo === 'pf') {
      router.replace('/(private)/pegada');
    } else {
      router.replace('/(private)/home');
    }
  } catch (error) {
  console.error('Erro ao fazer login:', error);
  
    // 🔄 Quando estiver usando a API real, substitua esse tratamento:
const mensagem = error?.message || 'Não foi possível acessar sua conta.';

    // 🔄 Por este (com axios, por exemplo):
    /*
    let mensagem = 'Não foi possível acessar sua conta.';
    if (error.response) {
      if (error.response.status === 403) {
        mensagem = 'Cadastro ainda não aprovado.';
      } else if (error.response.status === 401) {
        mensagem = 'CPF/CNPJ ou senha incorretos.';
      } else {
        mensagem = error.response.data?.erro || mensagem;
      }
    }
    */

  // 🔴 PJ não aprovado: encerra loading, mostra erro e limpa campos
  if (mensagem.includes('não aprovado')) {
    setMensagemErro(mensagem);
    setErroVisivel(true);
    setCpf('');
    setSenha('');
    setCarregando(false);
    return;
  }
  setTentativas(prev => prev + 1);

  if (tentativas + 1 >= 5) {
    setBloqueado(true);
    setMensagemErro('Por segurança, sua conta foi temporariamente bloqueada. Tente novamente em 30 segundos.');
    setTimeout(() => {
      setTentativas(0);
      setBloqueado(false);
    }, 30000);
  } else {
    setMensagemErro(error?.message || 'Não foi possível acessar sua conta.');
  }

  setErroVisivel(true);
  } finally {
    setCarregando(false); 
  }
};

  return (
    
    <View style={styles.contentBox}>
      <TouchableOpacity onPress={() => router.push('/(public)/admin')}>
      <Text>Ir para Admin</Text>
    </TouchableOpacity>

      <Text style={styles.titulo}>Bem-vindo ao EcoVoucher</Text>
      <Text style={styles.subtitulo}>Acesse sua conta</Text>

      <View style={styles.tipoBox}>
        <TouchableOpacity
          style={[styles.tipoBotao, tipoPessoa === 'pf' && styles.tipoSelecionado]}
          onPress={() => setTipoPessoa('pf')}
        >
          <Text
            style={[styles.tipoTexto, tipoPessoa === 'pf' && styles.tipoTextoSelecionado]}
          >
            Pessoa Física
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tipoBotao, tipoPessoa === 'pj' && styles.tipoSelecionado]}
          onPress={() => setTipoPessoa('pj')}
        >
          <Text
            style={[styles.tipoTexto, tipoPessoa === 'pj' && styles.tipoTextoSelecionado]}
          >
            Pessoa Jurídica
          </Text>
        </TouchableOpacity>
      </View>

      <FormLogin
        cpf={cpf}
        senha={senha}
        erros={erros}
        tipoPessoa={tipoPessoa} 
        handleChange={handleChange}
        mostrarSenha={mostrarSenha}
        setMostrarSenha={setMostrarSenha}
      />

      {Object.keys(erros).length > 0 && (
        <Text style={styles.erroAviso}>
          Preencha os campos obrigatórios corretamente
        </Text>
      )}

      {carregando ? (
        <ActivityIndicator
          color={colors.verde}
          size="large"
          style={{ marginTop: spacing.sm }}
        />
      ) : (
        <BotaoVerde
          texto={bloqueado ? "AGUARDE..." : "ENTRAR"}
          onPress={handleLogin}
          disabled={carregando || bloqueado || Object.keys(erros).length > 0}
        />

      )}

      <TouchableOpacity onPress={() => router.push('/(public)/recuperarsenha')}>
        <Text style={styles.esqueci}>Esqueci minha senha</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/(public)/cadastro')}>
        <Text style={styles.cadastroText}>
          Não tem conta? <Text style={styles.link}>Cadastre-se</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.rodape}>© 2025 EcoVoucher</Text>

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentBox: {
    maxWidth: 500,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
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
  esqueci: {
    textAlign: 'center',
    fontSize: fonts.size.sm,
    color: colors.verde,
    marginTop: spacing.sm,
    textDecorationLine: 'underline',
  },
  cadastroText: {
    marginTop: spacing.md,
    fontSize: fonts.size.sm,
    textAlign: 'center',
    color: colors.cinza,
  },
  link: {
    color: colors.verde,
    fontWeight: 'bold',
  },
  rodape: {
    fontSize: fonts.size.xs,
    textAlign: 'center',
    marginTop: spacing.sm,
    color: colors.cinza,
  },
  erroAviso: {
    color: colors.erro,
    textAlign: 'center',
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
});
