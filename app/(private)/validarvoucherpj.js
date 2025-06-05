import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import InputField from '../../components/InputField';
import BotaoVerde from '../../components/BotaoVerde';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';
import ModalSucesso from '../../components/ModalSucesso';
import ModalErro from '../../components/ModalErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import api from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import logoEcoApp from '../../assets/imagensEco/eco-novo.jpeg';
import { Masks } from 'react-native-mask-input';
import { useAuth } from '../../context/AuthContext';

export default function ValidarVoucherPJ() {
  const { usuario } = useAuth();
  const [codigo, setCodigo] = useState('');
  const [voucher, setVoucher] = useState(null);
  const [status, setStatus] = useState('');
  const [modoBusca, setModoBusca] = useState('codigo');
  const [cpfBusca, setCpfBusca] = useState('');
  const [tipoBusca, setTipoBusca] = useState('');
  const [vouchersEncontrados, setVouchersEncontrados] = useState([]);
  const [erros, setErros] = useState({});
  const [modalVisivel, setModalVisivel] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    if (usuario?.tipo !== 'pj') {
      setMensagemErro('Acesso restrito a Pessoa Jurídica');
      setErroVisivel(true);
    }
  }, []);

  const determinarStatus = (v) => {
    if (v.status === 'utilizado') return 'utilizado';
    const hoje = new Date();
    const validade = new Date(v.validade);
    return validade < hoje ? 'expirado' : 'válido';
  };

  const validarCodigo = async () => {
    if (!codigo.trim()) {
      setMensagemErro('Informe um código de voucher.');
      setErroVisivel(true);
      return;
    }

    try {
      const usuarios = await api.obterUsuarios();
      let encontrado = null;

      for (const usuario of usuarios) {
        const movimentacoes = usuario.movimentacoes || [];
        const mov = movimentacoes.find(
          (m) => m.codigo === codigo && m.tipo === 'saida'
        );
        if (mov) {
          encontrado = {
            ...mov,
            cpf: usuario.cpf,
            nome: usuario.nome || usuario.nomeEmpresa,
          };
          break;
        }
      }

      if (!encontrado) {
        setMensagemErro('Voucher não localizado.');
        setErroVisivel(true);
        setVoucher(null);
        return;
      }

      setVoucher(encontrado);
      setStatus(determinarStatus(encontrado));

    } catch (erro) {
      console.error('Erro ao validar voucher:', erro);
      setMensagemErro('Erro inesperado ao validar o voucher.');
      setErroVisivel(true);
    }
  };

  const confirmarUso = async (codigoConfirmar = null) => {
  try {
    const codigoAlvo = codigoConfirmar || voucher.codigo;
    await api.marcarVoucherComoUtilizado(codigoAlvo);
    
    setVoucher(null);
    setCodigo('');
    setVouchersEncontrados(vouchersEncontrados.filter(v => v.codigo !== codigoAlvo));
    setModalVisivel(true);
  } catch (error) {
    setMensagemErro(error.message);
    setErroVisivel(true);
  }
};


  const buscarPorCpfETipo = async () => {
    const dados = { cpf: cpfBusca };
    const campos = ['cpf'];
    const errosValidacao = validarCamposObrigatorios(dados, campos, 'pf');
    setErros(errosValidacao);

    if (Object.keys(errosValidacao).length > 0 || !tipoBusca.trim()) {
      setMensagemErro(!tipoBusca.trim() ? 'Selecione um tipo de voucher.' : 'CPF inválido.');
      setErroVisivel(true);
      return;
    }

    try {
      const usuarioPF = await api.obterUsuarioPorCPF(cpfBusca);
      const lista = (usuarioPF.movimentacoes || []).filter(
        (m) =>
          m.tipo === 'saida' &&
          m.status === 'valido' &&
          m.descricao?.toLowerCase().includes(tipoBusca.toLowerCase())
      );

      if (lista.length === 0) {
        setMensagemErro('Nenhum voucher válido encontrado.');
        setErroVisivel(true);
      }

      setVouchersEncontrados(lista);
    } catch (error) {
      setMensagemErro(error.message);
      setErroVisivel(true);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusFormatado = status.toLowerCase();
    let color = colors.cinzaClaro;
    let icon = 'help-circle-outline';
    let label = 'Desconhecido';

    if (statusFormatado === 'válido') {
      color = 'green';
      icon = 'checkmark-circle-outline';
      label = 'Válido';
    } else if (statusFormatado === 'expirado') {
      color = 'orange';
      icon = 'time-outline';
      label = 'Expirado';
    } else if (statusFormatado === 'utilizado') {
      color = 'red';
      icon = 'close-circle-outline';
      label = 'Utilizado';
    }

    return (
      <View style={[styles.statusBadge, { borderColor: color }]}>
        <Ionicons name={icon} size={16} color={color} style={{ marginRight: 4 }} />
        <Text style={{ color, fontWeight: 'bold' }}>{label}</Text>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image source={logoEcoApp} style={styles.logo} resizeMode="contain" />
      </View>

      <Text style={styles.titulo}>Validação de Voucher</Text>

      <View style={styles.switchContainer}>
        <BotaoVerdePequeno
          texto="Por Código"
          onPress={() => setModoBusca('codigo')}
          ativo={modoBusca === 'codigo'}
        />
        <BotaoVerdePequeno
          texto="Por CPF + Tipo"
          onPress={() => setModoBusca('cpf')}
          ativo={modoBusca === 'cpf'}
        />
      </View>

      {modoBusca === 'codigo' ? (
        <>
          <InputField
            label="Código do voucher"
            value={codigo}
            onChangeText={setCodigo}
            placeholder="Digite o código"
          />
          <BotaoVerde texto="Validar" onPress={validarCodigo} />

          {voucher && (
            <View style={styles.detalhes}>
              <Text style={styles.info}>Código: {voucher.codigo}</Text>
              <Text style={styles.info}>Tipo: {voucher.tipo}</Text>
              <Text style={styles.info}>Empresa: {voucher.empresa}</Text>
              <Text style={styles.info}>Endereço: {voucher.endereco}</Text>
              <Text style={styles.info}>Produtos: {voucher.produtos?.join(', ')}</Text>
              <Text style={styles.info}>Validade: {new Date(voucher.validade).toLocaleDateString('pt-BR')}</Text>
              <StatusBadge status={status} />
              {status === 'válido' && (
                <BotaoVerde texto="Confirmar uso" onPress={() => confirmarUso()} />
              )}
            </View>
          )}
        </>
      ) : (
        <>
          <InputField
            label="CPF do comprador"
            value={cpfBusca}
            onChangeText={setCpfBusca}
            placeholder="Digite o CPF"
            error={erros.cpf}
            mask={Masks.BRL_CPF}
            keyboardType="numeric"
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Tipo de voucher:</Text>
            <Picker
              selectedValue={tipoBusca}
              onValueChange={(itemValue) => setTipoBusca(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecione o tipo" value="" />
              <Picker.Item label="Alimentação" value="Alimentacao" />
              <Picker.Item label="Higiene" value="Higiene" />
              <Picker.Item label="Transporte" value="Transporte" />
            </Picker>
          </View>

          <BotaoVerde texto="Buscar Vouchers" onPress={buscarPorCpfETipo} />

          <FlatList
            data={vouchersEncontrados}
            keyExtractor={(item) => item.codigo}
            renderItem={({ item }) => (
              <View style={styles.detalhes}>
                <Text style={styles.info}>Código: {item.codigo}</Text>
                <Text style={styles.info}>Empresa: {item.empresa}</Text>
                <Text style={styles.info}>Endereço: {item.endereco}</Text>
                <Text style={styles.info}>Produtos: {item.produtos?.join(', ')}</Text>
                <Text style={styles.info}>Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</Text>
                <StatusBadge status={determinarStatus(item)} />
                {determinarStatus(item) === 'válido' && (
                  <BotaoVerde texto="Confirmar uso" onPress={() => confirmarUso(item.codigo)} />
                )}
              </View>
            )}
          />
        </>
      )}

      <ModalSucesso
        visivel={modalVisivel}
        mensagem="Voucher marcado como utilizado com sucesso!"
        onClose={() => setModalVisivel(false)}
      />
      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  paddingTop: spacing.lg,
  paddingBottom: spacing.xl,
},

 logoContainer: {
  alignItems: 'center',
  marginBottom: spacing.lg,
},
logo: {
  width: 160,
  height: 160,
},
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  detalhes: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.branco,
    borderRadius: 8,
    elevation: 2,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderColor: colors.cinzaClaro,
  },
  info: {
    fontSize: fonts.size.sm,
    marginBottom: spacing.xs,
    color: colors.preto,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fonts.size.sm,
    marginBottom: spacing.xs,
    color: colors.preto,
    textAlign: 'left',
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: colors.branco,
    borderRadius: 6,
    marginVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    width: '100%',
    maxWidth: 500,
  },
  picker: {
    height: 45,
    color: colors.preto,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
});
