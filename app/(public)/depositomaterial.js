import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Masks } from 'react-native-mask-input';
import InputField from '../../components/InputField';
import ModalComprovante from '../../components/ModalComprovante';
import apiMock from '../../services/apiMock';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import ModalErro from '../../components/ModalErro'; // NOVO


const materiaisDisponiveis = [
  { nome: 'Plástico', pontos: 10 },
  { nome: 'Alumínio', pontos: 15 },
  { nome: 'Vidro', pontos: 5 },
  { nome: 'Papel', pontos: 8 },
  { nome: 'Orgânico', pontos: 2 },
];



const gerarSimulacao = () => {
  return materiaisDisponiveis
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((m) => ({
      ...m,
      quantidade: Math.floor(Math.random() * 10) + 1,
    }));
};

const gerarCodigoDeposito = () => {
  const timestamp = Date.now();
  return `DEP-${timestamp}`;
};

export default function DepositoMaterial() {
  const [cpf, setCpf] = useState('');
  const [erros, setErros] = useState({});
  const [extrato, setExtrato] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const handleDeposito = async () => {
  const dados = { cpf };
  const campos = ['cpf'];
  const errosValidacao = validarCamposObrigatorios(dados, campos, 'pf');
  setErros(errosValidacao);

  // 🟥 CPF inválido (formato errado ou digito incorreto)
  if (Object.keys(errosValidacao).length > 0) {
    setMensagemErro('CPF inválido. Verifique e tente novamente.');
    setErroVisivel(true);
    return;
  }

  // 🔍 CPF válido, mas não encontrado no sistema
  const usuario = await apiMock.obterUsuarioPorCPF(cpf);
  if (!usuario) {
    setMensagemErro('CPF não cadastrado no sistema.');
    setErroVisivel(true);
    return;
  }

  // 🔄 Simulação do depósito
  const simulados = gerarSimulacao();
  const total = simulados.reduce(
    (acc, item) => acc + item.quantidade * item.pontos,
    0
  );
  const dataHora = new Date().toLocaleString('pt-BR');
  const codigo = gerarCodigoDeposito();

  try {
    await apiMock.registrarDeposito(cpf, simulados, total, codigo);
    setExtrato({ cpf, materiais: simulados, total, dataHora, codigo });
    setModalVisivel(true);
    setCpf('');
  } catch (error) {
    setMensagemErro(error.message || 'Erro ao registrar o depósito.');
    setErroVisivel(true);
  }
};

  return (
  <>
      <Text style={styles.titulo}>Depósito de Materiais</Text>
      <Text style={styles.subtitulo}>Simule seu depósito e ganhe pontos!</Text>

      <InputField
        label="CPF"
        value={cpf}
        onChangeText={(v) => {
          setCpf(v);
          setExtrato(null);
          setErros({});
        }}
        error={erros.cpf}
        mask={Masks.BRL_CPF}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.botao} onPress={handleDeposito}>
        <Text style={styles.botaoTexto}>Confirmar Depósito</Text>
      </TouchableOpacity>

      <ModalComprovante
        visible={modalVisivel}
        extrato={extrato}
        onClose={() => setModalVisivel(false)}
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
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: colors.verde,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    marginTop: spacing.md,
    alignItems:'center'
  },
  botaoTexto: {
    color: colors.branco,
    fontWeight: 'bold',
    fontSize: fonts.size.md,
    alignItems:'center'
  },
});
