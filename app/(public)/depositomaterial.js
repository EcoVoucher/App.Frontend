import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';

import { DepositoService } from '../../services/depositoService';
import { apenasNumeros } from '../../utils/formatarenvio';
import { Masks } from 'react-native-mask-input';
import InputField from '../../components/InputField';
import ModalComprovante from '../../components/ModalComprovante';
import ModalErro from '../../components/ModalErro';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

const materiaisDisponiveis = [
  { nome: 'Plástico', pontos: 10 },
  { nome: 'Alumínio', pontos: 15 },
  { nome: 'Vidro', pontos: 5 },
  { nome: 'Papel', pontos: 8 },
  { nome: 'Orgânico', pontos: 2 },
];

const gerarSimulacao = () =>
  materiaisDisponiveis
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .map((m) => ({ ...m, quantidade: Math.floor(Math.random() * 10) + 1 }));

export default function DepositoMaterial() {
  const [cpf, setCpf] = useState('');
  const [erros, setErros] = useState({});
  const [extrato, setExtrato] = useState(null);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleDeposito = async () => {
    if (carregando) return;

    // validação local do CPF
    const dados = { cpf };
    const campos = ['cpf'];
    const errosValidacao = validarCamposObrigatorios(dados, campos, 'pf');
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length > 0) {
      setMensagemErro('CPF inválido. Verifique e tente novamente.');
      setErroVisivel(true);
      return;
    }

    const cpfLimpo = apenasNumeros(cpf);

    // zera estados de feedback
    setExtrato(null);
    setErroVisivel(false);
    setMensagemErro('');
    setCarregando(true);

    try {
      // valida CPF no backend
      const usuario = await DepositoService.consultarUsuarioPorCPF(cpfLimpo);
      if (!usuario) {
        setMensagemErro('CPF não cadastrado no sistema.');
        setErroVisivel(true);
        return;
      }

      // simulação de materiais
      const simulados = gerarSimulacao();
      const total = simulados.reduce(
        (acc, item) => acc + (Number(item.quantidade) || 0) * (Number(item.pontos) || 0),
        0
      );

      if (total <= 0) {
        setMensagemErro('Nenhum material válido para pontuação.');
        setErroVisivel(true);
        return;
      }

      // registra depósito
      const comprovante = await DepositoService.realizarDeposito(cpfLimpo, simulados, total);

      const codigo =
        comprovante?.deposito?.codigo ??
        comprovante?.deposito?._id ??
        '---';

      const dataHora = new Date(
        comprovante?.deposito?.data ?? Date.now()
      ).toLocaleString('pt-BR');

      setExtrato({
        cpf,
        materiais: simulados,
        total,
        dataHora,
        codigo,
      });

      setModalVisivel(true);
      setCpf(''); // limpa somente após sucesso
    } catch (error) {
      setMensagemErro(obterMensagemErro(error, 'Erro ao registrar o depósito.'));
      setErroVisivel(true);
    } finally {
      setCarregando(false);
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

        <TouchableOpacity
          style={[styles.botao, carregando && { opacity: 0.7 }]}
          onPress={handleDeposito}
          disabled={carregando}
        >
          <Text style={styles.botaoTexto}>{carregando ? 'Registrando...' : 'Confirmar Depósito'}</Text>
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
    alignItems: 'center',
  },
  botaoTexto: {
    color: colors.branco,
    fontWeight: 'bold',
    fontSize: fonts.size.md,
  },
});
