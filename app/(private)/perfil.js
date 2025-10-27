import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  Image,
  TouchableOpacity,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useAuth } from '../../context/AuthContext';
import { UsuarioService } from '../../services/usuarioService';
import { VouchersService } from '../../services/voucherService';
import { PegadaService } from '../../services/pegadaService';

import FormSenhaPerfil from '../../components/forms/FormSenhaPerfil';
import ModalErro from '../../components/ModalErro';
import ModalSucesso from '../../components/ModalSucesso';

import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

// Helper para aceitar services com ou sem { ok, data }
const toResult = (res) =>
  res && typeof res === 'object' && 'ok' in res ? res : { ok: true, data: res };

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
  const [trocandoSenha, setTrocandoSenha] = useState(false);

  const [mostrarSenhaAtual, setMostrarSenhaAtual] = useState(false);
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);

  const [erros, setErros] = useState({});
  const [modalErro, setModalErro] = useState('');
  const [modalSucesso, setModalSucesso] = useState('');

  useEffect(() => {
    if (usuario) carregarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario]);

  const carregarDados = async () => {
    try {
      const documento = usuario.cpf || usuario.cnpj;

      // 🔹 Usuario (compatível com {ok,data} e objeto direto)
      const userRes = toResult(await UsuarioService.obterPorId(documento));
      if (!userRes.ok) {
        setModalErro(obterMensagemErro(userRes.error, 'Erro ao carregar dados do usuário.'));
        return;
      }
      const user = userRes.data || {};
      setPontos(user.pontos ?? 0);
      setDepositos(user.depositos ?? 0);

      if (usuario.tipo === 'pf') {
        // 🔹 Pegada
        const histRes = toResult(await PegadaService.obterHistorico(documento));
        const lista = Array.isArray(histRes.data) ? histRes.data : [];
        if (lista.length > 0) {
          setPegada(lista[lista.length - 1]?.pontuacao ?? null);
        }
      }

      if (usuario.tipo === 'pj') {
        // 🔹 Vouchers do PJ
        const lotesRes = toResult(await VouchersService.listarVouchers(usuario.cnpj));
        const estatRes = toResult(await VouchersService.obterEstatisticas());

        const lotes = Array.isArray(lotesRes.data) ? lotesRes.data : [];
        const totalVouchersGerados = lotes.reduce((acc, lote) => acc + (lote.quantidade ?? 0), 0);
        setQtdVouchers(totalVouchersGerados);

        const totalComprados = estatRes.data?.totalComprados ?? 0;
        setVouchersAdquiridos(totalComprados);

        if (!lotesRes.ok) {
          setModalErro(obterMensagemErro(lotesRes.error, 'Erro ao carregar lotes.'));
        } else if (!estatRes.ok) {
          setModalErro(obterMensagemErro(estatRes.error, 'Erro ao carregar estatísticas.'));
        }
      }
    } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao carregar dados.');
      setModalErro(mensagem);
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

    // mapeia possível erro retornado sob "senha" para "novaSenha" (compat c/ seu validador)
    if (errosValidacao.senha && !errosValidacao.novaSenha) {
      errosValidacao.novaSenha = errosValidacao.senha;
      delete errosValidacao.senha;
    }

    if (novaSenha && confirmarNovaSenha && novaSenha !== confirmarNovaSenha) {
      errosValidacao.confirmarSenha = 'As senhas não conferem.';
    }

    setErros(errosValidacao);
    if (Object.keys(errosValidacao).length > 0) return;

    setTrocandoSenha(true);
    try {
      const res = toResult(
        await UsuarioService.alterarSenha(usuario.cpf || usuario.cnpj, senhaAtual, novaSenha)
      );

      if (!res.ok) {
        setModalErro(obterMensagemErro(res.error, 'Erro ao alterar senha.'));
        return;
      }

      setModalSucesso('Senha alterada com sucesso!');
      setSenhaAtual('');
      setNovaSenha('');
      setConfirmarNovaSenha('');
      setSenhaAberta(false);
    } catch (error) {
      setModalErro(obterMensagemErro(error, 'Erro ao alterar senha.'));
    } finally {
      setTrocandoSenha(false);
    }
  };

  const toggleSenha = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setSenhaAberta((v) => !v);
  };

  const nomeFormatado =
    usuario.tipo === 'pf'
      ? (usuario.nome || '').replace(/\b\w/g, (l) => l.toUpperCase())
      : (usuario.nomeEmpresa || '').toUpperCase();

  const enderecoFormatado = [
    usuario.endereco,
    usuario.numero,
    usuario.bairro,
    usuario.cidade,
    usuario.cep,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={styles.container}
      enableOnAndroid
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
    >
      {/* Dados Cadastrais */}
      <View style={styles.card}>
        <View style={styles.header}>
          <Image
            source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.logo}
          />
          <View>
            <Text style={styles.titulo}>
              Seu Perfil{'\n'}
              {nomeFormatado}
            </Text>
            <Text style={styles.subtitulo}>Transforme suas ações em benefícios</Text>
          </View>
        </View>

        <Text style={styles.cardTitle}>📄 Dados Cadastrais</Text>
        <View style={styles.linha}>
          <Text style={styles.label}>Nome:</Text>
          <Text style={styles.valor}>{nomeFormatado}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.label}>{usuario.tipo === 'pf' ? 'CPF:' : 'CNPJ:'}</Text>
          <Text style={styles.valor}>{usuario.cpf || usuario.cnpj}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.valor}>{usuario.email}</Text>
        </View>
        <View style={styles.linha}>
          <Text style={styles.label}>Endereço:</Text>
          <Text style={styles.valor}>{enderecoFormatado}</Text>
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
                <Text style={styles.valorInfo}>{pegada !== null ? pegada : '---'}</Text>
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

      {/* Alterar Senha */}
      <View style={styles.card}>
        <TouchableOpacity onPress={toggleSenha}>
          <Text style={styles.cardTitle}>🔐 Alterar Senha {senhaAberta ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {senhaAberta && (
          <FormSenhaPerfil
            senhaAtual={senhaAtual}
            setSenhaAtual={setSenhaAtual}
            novaSenha={novaSenha}
            setNovaSenha={setNovaSenha}
            confirmarNovaSenha={confirmarNovaSenha}
            setConfirmarNovaSenha={setConfirmarNovaSenha}
            erros={erros}
            mostrarSenhaAtual={mostrarSenhaAtual}
            setMostrarSenhaAtual={setMostrarSenhaAtual}
            mostrarNovaSenha={mostrarNovaSenha}
            setMostrarNovaSenha={setMostrarNovaSenha}
            mostrarConfirmar={mostrarConfirmar}
            setMostrarConfirmar={setMostrarConfirmar}
            carregando={trocandoSenha}
            onSubmit={handleAlterarSenha}
          />
        )}
      </View>

      <ModalErro visivel={!!modalErro} mensagem={modalErro} onClose={() => setModalErro('')} />
      <ModalSucesso
        visivel={!!modalSucesso}
        mensagem={modalSucesso}
        onFechar={() => setModalSucesso('')}
      />
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    gap: 10,
  },
  logo: {
    width: 80,
    height: 80,
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
