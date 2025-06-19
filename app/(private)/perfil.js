import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';

import ModalErro from '../../components/ModalErro';
import ModalSucesso from '../../components/ModalSucesso';
import InputText from '../../components/InputText';
import BotaoVerde from '../../components/BotaoVerde';

export default function Perfil() {
  const { usuario } = useAuth();
  const [pontos, setPontos] = useState(0);
  const [depositos, setDepositos] = useState(0);
  const [pegada, setPegada] = useState(null);
  const [qtdVouchers, setQtdVouchers] = useState(0);
  const [vouchersAdquiridos, setVouchersAdquiridos] = useState(0);

  const [senhaAberta, setSenhaAberta] = useState(false);

  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [erros, setErros] = useState({});
  const [modalErro, setModalErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState('');

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const user =
        usuario.tipo === 'pf'
          ? await api.obterUsuarioPorCPF(usuario.cpf)
          : await api.obterUsuarioPorCNPJ(usuario.cnpj);

      setPontos(user.pontos || 0);
      setDepositos(user.depositos?.length || 0);

      if (usuario.tipo === 'pf') {
        const historico = await api.obterHistoricoPegada(usuario.cpf);
        if (historico.length > 0) {
          setPegada(historico[historico.length - 1].pontuacao);
        }
      }

      if (usuario.tipo === 'pj') {
        const vouchers = await api.obterVouchersPorCNPJ(usuario.cnpj);
        const totalGerados = vouchers.reduce(
          (acc, v) => acc + (v.quantidade || 0),
          0
        );
        setQtdVouchers(totalGerados);

        const adquiridos = await api.contarVouchersCompradosPorCNPJ(
          usuario.cnpj
        );
        setVouchersAdquiridos(adquiridos);
      }
    } catch (error) {
      setModalErro(error.message);
    }
  };

  const handleAlterarSenha = async () => {
    const dados = {
      senhaAtual,
      novaSenha,
      confirmarSenha: confirmarNovaSenha,
    };
    const campos = ['senhaAtual', 'novaSenha', 'confirmarSenha'];
    const errosValidacao = validarCamposObrigatorios(dados, campos);
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length > 0) return;

    try {
      await api.alterarSenha(
        usuario.cpf || usuario.cnpj,
        senhaAtual,
        novaSenha
      );
      setModalSucesso('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      setSenhaAberta(false);
    } catch (error) {
      setModalErro(error.message);
    }
  };

  const toggleSenha = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSenhaAberta(!senhaAberta);
  };

  const nomeFormatado =
    usuario.tipo === 'pf'
      ? (usuario.nome || '').replace(/\b\w/g, (l) => l.toUpperCase())
      : (usuario.nomeEmpresa || '').toUpperCase();

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.logo}
          />
          <View>
            <Text style={styles.titulo}>Olá, {nomeFormatado}</Text>
            <Text style={styles.subtitulo}>
              Transforme suas ações em benefícios
            </Text>
          </View>
        </View>

        {/* Dados Cadastrais */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📄 Dados Cadastrais</Text>
          <View style={styles.linha}>
            <Text style={styles.label}>Nome:</Text>
            <Text style={styles.valor}>{nomeFormatado}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>
              {usuario.tipo === 'pf' ? 'CPF:' : 'CNPJ:'}
            </Text>
            <Text style={styles.valor}>{usuario.cpf || usuario.cnpj}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Email:</Text>
            <Text style={styles.valor}>{usuario.email}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Telefone:</Text>
            <Text style={styles.valor}>{usuario.telefone}</Text>
          </View>
          <View style={styles.linha}>
            <Text style={styles.label}>Endereço:</Text>
            <Text style={styles.valor}>
              {`${usuario.endereco}, ${usuario.numero} - ${usuario.bairro}, ${usuario.cidade} - ${usuario.cep}`}
            </Text>
          </View>
        </View>

        {/* Informações da Conta */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Informações da Conta</Text>
          <View style={styles.cardGrid}>
            {usuario.tipo === 'pf' ? (
              <>
                <View style={styles.boxInfo}>
                  <Text style={styles.valorInfo}>{pontos}</Text>
                  <Text style={styles.labelInfo}>Pontos</Text>
                </View>
                <View style={styles.boxInfo}>
                  <Text style={styles.valorInfo}>
                    {pegada !== null ? pegada : '---'}
                  </Text>
                  <Text style={styles.labelInfo}>Pegada</Text>
                </View>
                <View style={styles.boxInfo}>
                  <Text style={styles.valorInfo}>{depositos}</Text>
                  <Text style={styles.labelInfo}>Depósitos</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.boxInfo}>
                  <Text style={styles.valorInfo}>{qtdVouchers}</Text>
                  <Text style={styles.labelInfo}>Vouchers Gerados</Text>
                </View>
                <View style={styles.boxInfo}>
                  <Text style={styles.valorInfo}>{vouchersAdquiridos}</Text>
                  <Text style={styles.labelInfo}>Adquiridos por PF</Text>
                </View>
              </>
            )}
          </View>
        </View>

       <View style={styles.card}>
  <TouchableOpacity onPress={toggleSenha}>
    <Text style={styles.cardTitle}>
      🔐 Alterar Senha {senhaAberta ? '▲' : '▼'}
    </Text>
  </TouchableOpacity>

  {senhaAberta && (
    <>
      <InputText
        placeholder="Senha atual"
        value={senhaAtual}
        onChangeText={setSenhaAtual}
        secureTextEntry={!mostrarSenhaAtual}
        error={erros.senhaAtual}
        mostrarSenha={mostrarSenhaAtual}
        alternarSenha={() => setMostrarSenhaAtual(!mostrarSenhaAtual)}
        containerStyle={{ marginBottom:spacing.md }}
      />

      <InputText
        placeholder="Nova senha"
        value={novaSenha}
        onChangeText={setNovaSenha}
        secureTextEntry={!mostrarNovaSenha}
        error={erros.novaSenha}
        mostrarSenha={mostrarNovaSenha}
        alternarSenha={() => setMostrarNovaSenha(!mostrarNovaSenha)}
        containerStyle={{ marginBottom:spacing.md }}

      />

      <InputText
        placeholder="Confirmar nova senha"
        value={confirmarNovaSenha}
        onChangeText={setConfirmarNovaSenha}
        secureTextEntry={!mostrarConfirmar}
        error={erros.confirmarSenha}
        mostrarSenha={mostrarConfirmar}
        alternarSenha={() => setMostrarConfirmar(!mostrarConfirmar)}
        containerStyle={{ marginBottom:spacing.md }}
      />

      <BotaoVerde texto="Salvar nova senha" onPress={handleAlterarSenha} />
    </>
  )}
</View>
        <ModalErro
          visivel={!!modalErro}
          mensagem={modalErro}
          onClose={() => setModalErro('')}
        />
        <ModalSucesso
          visivel={!!modalSucesso}
          mensagem={modalSucesso}
          onFechar={() => setModalSucesso('')}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 10,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
  },
  card: {
    backgroundColor: colors.branco,
    borderRadius: 14,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.sm,
  },
  linha: {
    marginBottom: 6,
  },
  label: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
  },
  valor: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
    fontWeight: fonts.weight.medium,
  },
  cardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: spacing.sm,
  },
  boxInfo: {
    flex: 1,
    backgroundColor: colors.fundoClaro,
    borderRadius: 10,
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borda,
  },
  valorInfo: {
    fontSize: fonts.size.lg,
    color: colors.verde,
    fontWeight: fonts.weight.bold,
  },
  labelInfo: {
    color: colors.cinza,
    marginTop: 4,
    fontSize: fonts.size.xs,
  },
});
