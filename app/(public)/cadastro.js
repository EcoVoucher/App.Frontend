import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import ModalErro from '../../components/ModalErro';
import BotaoVerde from '../../components/BotaoVerde';
import FormCadastro from '../../components/forms/FormCadastro';
import { cadastrarPF, cadastrarPJ } from '../../services/usuarioService';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { formatarCadastro } from '../../utils/formatarenvio';
import ModalSucesso from '../../components/ModalSucesso';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

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
  confirmarSenha: '',
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
  const [camposBloqueados, setCamposBloqueados] = useState(true);

  // evita “corrida” nas buscas de CEP
  const cepAbortRef = useRef(null);

  const handleChange = (campo, valor) => {
    if (carregando) return;

    if (campo === 'cep') {
      const cepLimpo = valor.replace(/\D/g, '');

      setDados((prev) => ({ ...prev, cep: valor }));

      if (cepLimpo.length === 8) {
        buscarEndereco(cepLimpo);
      }
      return;
    }

    if (['endereco', 'bairro', 'cidade', 'estado'].includes(campo) && camposBloqueados) {
      return;
    }

    setDados((prev) => ({ ...prev, [campo]: valor }));

    setErros((prev) => {
      const novosErros = { ...prev };
      if (String(valor).trim()) delete novosErros[campo];
      return novosErros;
    });
  };

  const buscarEndereco = async (cep) => {
    try {
      // cancela busca anterior (se houver)
      if (cepAbortRef.current) cepAbortRef.current.abort();
      const controller = new AbortController();
      cepAbortRef.current = controller;

      // limpa erro anterior do CEP
      setErros((prev) => {
        const n = { ...prev };
        delete n.cep;
        return n;
      });

      const timeout = setTimeout(() => controller.abort(), 7000);
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, { signal: controller.signal });
      clearTimeout(timeout);

      if (!res.ok) throw new Error(`viaCEP status ${res.status}`);

      const data = await res.json();

      // se o usuário já mudou o CEP, ignora esta resposta
      const cepAtual = (dados.cep || '').replace(/\D/g, '');
      if (cepAtual !== cep) return;

      if (data?.erro) {
        setErros((prev) => ({ ...prev, cep: 'CEP inválido. Verifique e tente novamente.' }));
       
        return;
      }

      setDados((prev) => ({
        ...prev,
        endereco: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      }));
    } catch (e) {
      if (e?.name === 'AbortError') return; // usuário digitou outro CEP rápido
      setErros((prev) => ({ ...prev, cep: 'Erro ao buscar endereço. Tente novamente mais tarde.' }));
      
    } finally {
      cepAbortRef.current = null;
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
      'confirmarSenha',
    ];

    return [...obrigatorios, ...comuns].every((campo) => String(dados[campo] || '').trim());
  };

  const validarCampos = () => {
    const campos = tipoPessoa === 'pf'
      ? [
          'nome', 'dataNascimento', 'cpf', 'telefone', 'cep', 'endereco',
          'bairro', 'cidade', 'estado', 'numero', 'email', 'senha', 'confirmarSenha',
        ]
      : [
          'nomeEmpresa', 'cnpj', 'telefone', 'cep', 'endereco', 'bairro',
          'cidade', 'estado', 'numero', 'email', 'senha', 'confirmarSenha',
        ];

    const novoErros = validarCamposObrigatorios(dados, campos, tipoPessoa);

    // senha === confirmarSenha (garantia extra caso seu validador não cubra)
    if ((dados.senha || '') !== (dados.confirmarSenha || '')) {
      novoErros.confirmarSenha = 'As senhas não coincidem.';
    }

    setErros(novoErros);
    return Object.keys(novoErros).length === 0;
  };

  const handleCadastro = async () => {
    if (carregando) return;

    if (!tipoPessoa) {
      setMensagemErro('Selecione Pessoa Física ou Jurídica para continuar.');
      setErroVisivel(true);
      return;
    }

    // 1) Validação local
    if (!validarCampos()) return;

    setCarregando(true);
    try {
      const dadosFormatados = formatarCadastro(dados);

      // 2) Chamada
      const res = tipoPessoa === 'pf'
        ? await cadastrarPF(dadosFormatados)
        : await cadastrarPJ(dadosFormatados);

      // 3) Erro → ModalErro
      if (!res.ok) {
        const mensagem = obterMensagemErro(res.error);
        setMensagemErro(mensagem);
        setErroVisivel(true);

        // regra especial sua
        if (mensagem.includes('CNPJ')) {
          setDados(ESTADO_INICIAL);
          setErros({});
        }
        return;
      }

      // 4) Sucesso → ModalSucesso
      setModalSucesso(true);
    } finally {
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
            desabilitado={!camposPreenchidos() || carregando}
            mostrarSenha={mostrarSenha}
            setMostrarSenha={setMostrarSenha}
            mostrarConfirmarSenha={mostrarConfirmarSenha}
            setMostrarConfirmarSenha={setMostrarConfirmarSenha}
            carregando={carregando}
            camposBloqueados={camposBloqueados} // se o Form precisar desabilitar inputs
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
        onFechar={() => {
          setModalSucesso(false);
          setDados(ESTADO_INICIAL);
          setErros({});
          setTipoPessoa(null);
        }}
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
                  texto="Ir para Login"
                  onPress={() => {
                    setModalSucesso(false);
                    setDados(ESTADO_INICIAL);
                    setErros({});
                    setTipoPessoa(null);
                    router.replace('/login');
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
                    router.replace('/login');
                  }}
                />
              </>
            )
        }
      />

      {/* Modal erro */}
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
