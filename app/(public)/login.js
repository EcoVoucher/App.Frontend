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
import apiMock from '../../services/apiMock';
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
    if (carregando) return; 
    if (!validarCampos()) {
      setMensagemErro('Por favor, preencha CPF/CNPJ e senha corretamente.');
      setErroVisivel(true);
      return;
    }

    const apenasNumeros = cpf.replace(/\D/g, '');

    if (tipoPessoa === 'pf' && apenasNumeros.length !== 11) {
      setMensagemErro('Você selecionou Pessoa Física, mas o CPF está inválido.');
      setErroVisivel(true);
      return;
    }

    if (tipoPessoa === 'pj' && apenasNumeros.length !== 14) {
      setMensagemErro('Você selecionou Pessoa Jurídica, mas o CNPJ está inválido.');
      setErroVisivel(true);
      return;
    }

    setCarregando(true);

    try {
      const { token, usuario } = await apiMock.login(cpf, senha, tipoPessoa);
      await login({ token, usuario });

      if (usuario.primeiroAcesso && usuario.tipo === 'pf') {
      router.replace('/(private)/pegada');
      } else {
        router.replace('/(private)/home');
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      setMensagemErro(
        error?.message?.toString() || error?.toString() || 'Não foi possível acessar sua conta.'
      );
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.contentBox}>
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
          texto="ENTRAR"
          onPress={handleLogin}
          disabled={carregando || Object.keys(erros).length > 0}
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
