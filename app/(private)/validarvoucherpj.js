import React, { useState } from 'react';
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

import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';

import { VouchersService } from '../../services/voucherService';

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

  const [validando, setValidando] = useState(false);
  const [buscando, setBuscando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

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

      if (validando) return; 
      setValidando(true);

    try {
       const resultado = await VouchersService.validarVoucherPorCodigo(
        codigo.trim().toUpperCase(),
        usuario.cnpj
      );

      if (!resultado) {
        setMensagemErro('Voucher não localizado.');
        setErroVisivel(true);
        setVoucher(null);
        return;
      }
          setVoucher({ ...resultado });
      setStatus(determinarStatus(resultado));
    } catch (erro) {
      const mensagem = obterMensagemErro(erro, 'Erro ao validar voucher.');
      setMensagemErro(mensagem);
      setErroVisivel(true);
    } finally {
      setValidando(false);
    }
  };


      const confirmarUso = async (codigoConfirmar = null) => {
        if (confirmando) return; 
        setConfirmando(true);

        try {
          const codigoAlvo = codigoConfirmar || voucher.codigo;

         await VouchersService.utilizarVoucher(codigoAlvo, usuario.cnpj);

      setVoucher(null);
      setCodigo('');
      setVouchersEncontrados(
        vouchersEncontrados.filter((v) => v.codigo !== codigoAlvo)
      );
      setModalVisivel(true);
    } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao confirmar uso.');
      setMensagemErro(mensagem);
      setErroVisivel(true);
    } finally {
      setConfirmando(false);
    }
  };
        const buscarPorCpfETipo = async () => {
          if (buscando) return;
          setBuscando(true); 

        const dados = { cpf: cpfBusca };
        const campos = ['cpf'];
        const errosValidacao = validarCamposObrigatorios(dados, campos, 'pf');
        setErros(errosValidacao);

        if (Object.keys(errosValidacao).length > 0 || !tipoBusca.trim()) {
          setMensagemErro(!tipoBusca.trim() ? 'Selecione um tipo de voucher.' : 'CPF inválido.');
          setErroVisivel(true);
          setBuscando(false); // 🔥 Destrava o botão
          return;              // 🔥 Interrompe a busca
        }

        try {
        const resultado = await VouchersService.buscarVouchersPorCpfETipo(
          cpfBusca,
          tipoBusca,
          usuario.cnpj
        );

         if (!resultado || resultado.length === 0) {
        setMensagemErro('Nenhum voucher válido encontrado.');
        setErroVisivel(true);
      }
        setVouchersEncontrados(resultado);
       } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao buscar vouchers.');
      setMensagemErro(mensagem);
      setErroVisivel(true);
    } finally {
      setBuscando(false);
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
            onChangeText={(text) => setCodigo(text.toUpperCase())}
            placeholder="Digite o código"
          />
         <BotaoVerde
            texto={validando ? 'Validando...' : 'Validar'}
            onPress={validarCodigo}
            disabled={validando}
          />
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

          <BotaoVerde
              texto={buscando ? 'Buscando...' : 'Buscar Vouchers'}
              onPress={buscarPorCpfETipo}
              disabled={buscando}
            />
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
                  <BotaoVerde
                  texto={confirmando ? 'Confirmando...' : 'Confirmar uso'}
                  onPress={() => confirmarUso(item?.codigo)}
                  disabled={confirmando}
                />
                )}
              </View>
            )}
          />
        </>
      )}

      <ModalSucesso
        visivel={modalVisivel}
        mensagem="Voucher marcado como utilizado com sucesso!"
        onFechar={() => setModalVisivel(false)}
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
    textAlign: 'center',
    width: '100%',
  },
  pickerContainer: {
    backgroundColor: colors.branco,
    borderRadius: 6,
    marginVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    width: '100%',
    maxWidth: 500,
    textAlign: 'center',
    justifyContent:"center"
  },
  picker: {
    height: 55,
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
