import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  LayoutAnimation,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { UsuarioService } from '../../services/usuarioService';
import { VouchersService } from '../../services/voucherService';
import { PegadaService } from '../../services/pegadaService';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

import FormSenhaPerfil from '../../components/forms/FormSenhaPerfil';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalErro from '../../components/ModalErro';
import ModalSucesso from '../../components/ModalSucesso';


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
      const documento = usuario.cpf || usuario.cnpj;
      const user = await UsuarioService.obterPorId(documento);

      setPontos(user.pontos ?? 0);
      setDepositos(user.depositos);

      if (usuario.tipo === 'pf') {
        const historico = await PegadaService.obterHistorico(documento);
        if (historico.length > 0) {
          setPegada(historico[historico.length - 1].pontuacao);
        }
      }
if (usuario.tipo === 'pj') {
        const lotes = await VouchersService.listarVouchers(usuario.cnpj); 
        const estatisticas = await VouchersService.obterEstatisticas();

        const totalVouchersGerados = lotes.reduce((acc, lote) => acc + (lote.quantidade ?? 0), 0);
        setQtdVouchers(totalVouchersGerados);
        setVouchersAdquiridos(estatisticas?.totalComprados ?? 0);
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
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length > 0) return;

    try {
      await UsuarioService.alterarSenha(
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
    const mensagem = obterMensagemErro(error, 'Erro ao alterar senha.');
    setModalErro(mensagem);
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
   <KeyboardAwareScrollView
  contentContainerStyle={styles.container}
  enableOnAndroid={true}
  extraScrollHeight={20}
  keyboardShouldPersistTaps="handled"
>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Dados Cadastrais */}
        <View style={styles.card}>
          <View style={styles.header}>
          <Image
            source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.logo}
          />
          <View>
            <Text style={styles.titulo}>Seu Perfil{'\n'}{nomeFormatado}</Text>
            <Text style={styles.subtitulo}>
              Transforme suas ações em benefícios
            </Text>
          </View>
        </View>
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
        carregando={false}
        onSubmit={handleAlterarSenha}
      />
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
</KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container:{

  },
  header: {
    marginTop:spacing.xx,
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