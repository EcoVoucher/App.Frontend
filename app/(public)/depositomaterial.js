import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';

import apiMock from '../../services/apiMock'; // 🔄 Mock funcionando hoje
import { DepositoService } from '../../services/depositoService'; // 🔗 API real — pronto para ativar

import { Masks } from 'react-native-mask-input';
import InputField from '../../components/InputField';
import ModalComprovante from '../../components/ModalComprovante';
import ModalErro from '../../components/ModalErro';

import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

// 🔄 Materiais disponíveis para simulação no mock
const materiaisDisponiveis = [
  { nome: 'Plástico', pontos: 10 },
  { nome: 'Alumínio', pontos: 15 },
  { nome: 'Vidro', pontos: 5 },
  { nome: 'Papel', pontos: 8 },
  { nome: 'Orgânico', pontos: 2 },
];

// 🔄 Função que gera simulação de materiais — Usada no mock (mantém no front mesmo com API)
const gerarSimulacao = () => {
  return materiaisDisponiveis
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((m) => ({
      ...m,
      quantidade: Math.floor(Math.random() * 10) + 1,
    }));
};

// 🔄 Gerador de código local — Só no mock (API gera automaticamente)
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

    if (Object.keys(errosValidacao).length > 0) {
      setMensagemErro('CPF inválido. Verifique e tente novamente.');
      setErroVisivel(true);
      return;
    }

    try {
      // 🔄 MOCK — Validação de CPF no mock
      const usuario = await apiMock.obterUsuarioPorCPF(cpf);

      // 🔗 API — Validação de CPF na API (ATIVAR no futuro)
      // const usuario = await DepositoService.consultarUsuarioPorCPF(cpf);

      if (!usuario) {
        setMensagemErro('CPF não cadastrado no sistema.');
        setErroVisivel(true);
        return;
      }

      // 🔄 MOCK — Simulação de materiais e geração de código local
      const simulados = gerarSimulacao();
      const total = simulados.reduce(
        (acc, item) => acc + item.quantidade * item.pontos,
        0
      );
      const dataHora = new Date().toLocaleString('pt-BR');
      const codigo = gerarCodigoDeposito();

      // 🔄 MOCK — Registrar depósito no mock (funcionando hoje)
      await apiMock.registrarDeposito(cpf, simulados, total, codigo);

      // 🔗 API — Registrar depósito na API (ATIVAR no futuro)
      /*
      const comprovante = await DepositoService.realizarDeposito(cpf, simulados, total);

      const codigo = comprovante.deposito?.codigo 
                  ?? comprovante.deposito?._id 
                  ?? '---';

      const dataHora = new Date(comprovante.deposito?.data).toLocaleString('pt-BR');
      */

      // 🔸 Atualiza estado para exibir no modal de comprovante (funciona igual no mock e na API)
      setExtrato({
        cpf,
        materiais: simulados,
        total,
        dataHora,
        codigo,
      });

      setModalVisivel(true);
      setCpf('');
    } catch (error) {
      setMensagemErro(
        error.response?.data?.message ||
        error.message ||
        'Erro ao registrar o depósito.'
      );
      setErroVisivel(true);
    }
  };

  return (
  <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
  >
     <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
       </ScrollView>
 </KeyboardAvoidingView>
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
