
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import BotaoVerde from '../../components/BotaoVerde';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';
import InputField from '../../components/InputField';
import ModalSucesso from '../../components/ModalSucesso';
import SelectField from '../../components/SelectField';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';

const { width, height } = Dimensions.get('window');

const produtosPorTipo = {
  Alimentacao: ['Marmitex', 'Arroz 5kg', 'Feijão 1kg', 'Leite integral', 'Cesta básica'],
  Higiene: ['Pasta dental Colgate', 'Sabonete Dove', 'Papel higiênico', 'Shampoo', 'Sabão em barra'],
  Transporte: ['Metrô', 'Ônibus'],
};

export default function CatalogoRecompensaPJ() {
  const { usuario } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [tipo, setTipo] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');
  const [erros, setErros] = useState({});
  const [vouchersGerados, setVouchersGerados] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [criterioOrdenacao, setCriterioOrdenacao] = useState('validade');
  const [busca, setBusca] = useState('');

  const carregarVouchers = async () => {
    const lista = await apiMock.obterVouchersPorCNPJ(usuario.cnpj);
    const filtrado = lista
      .filter((item) => {
        if (filtroStatus === 'validos') return new Date(item.dataValidade) >= new Date();
        if (filtroStatus === 'expirados') return new Date(item.dataValidade) < new Date();
        return true;
      })
      .filter((item) => item.tipo.toLowerCase().includes(busca.toLowerCase()));

    const ordenado = [...filtrado].sort((a, b) => {
      if (criterioOrdenacao === 'tipo') return a.tipo.localeCompare(b.tipo);
      if (criterioOrdenacao === 'uso') {
        const usadosA = a.quantidade - a.codigos.length;
        const usadosB = b.quantidade - b.codigos.length;
        const percA = a.quantidade > 0 ? usadosA / a.quantidade : 0;
        const percB = b.quantidade > 0 ? usadosB / b.quantidade : 0;
        return percB - percA;
      }
      return new Date(a.dataValidade) - new Date(b.dataValidade);
    });

    setVouchersGerados(ordenado);
  };

  useEffect(() => {
    carregarVouchers();
  }, [criterioOrdenacao, filtroStatus, busca]);

  const totalLotes = vouchersGerados.length;
  const totalVouchers = vouchersGerados.reduce((acc, v) => acc + v.quantidade, 0);
  const totalUtilizados = vouchersGerados.reduce((acc, v) => acc + (v.quantidade - v.codigos.length), 0);

  const handleAbrirModal = () => {
    setTipo('');
    setProdutos([]);
    setQuantidade('');
    setDataValidade('');
    setErros({});
    setModalVisible(true);
  };

  return (
  <>
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.boxResumo}>
        <Text style={styles.titulo}>Histórico de Vouchers Emitidos</Text>
        <Text style={styles.subtitulo}>
          🧾 Lotes: {totalLotes} · ✅ Ativos: {totalVouchers - totalUtilizados} · 🔁 Adquiridos: {totalUtilizados}
        </Text>

        <View style={styles.filtrosLinha}>
          {['todos', 'válidos', 'expirados'].map((value) => (
            <View key={value} style={styles.botaoFiltroBox}>
              <BotaoVerdePequeno
                texto={value.charAt(0).toUpperCase() + value.slice(1)}
                onPress={() => setFiltroStatus(value)}
                ativo={filtroStatus === value}
              />
            </View>
          ))}
        </View>


        <View style={styles.linhaAcao}>
          <View style={styles.ordenarBox}>
            <SelectField
              label="Ordenar por:"
              selectedValue={criterioOrdenacao}
              onValueChange={setCriterioOrdenacao}
              options={[
                { label: 'Validade (mais próximas primeiro)', value: 'validade' },
                { label: 'Tipo de voucher (A-Z)', value: 'tipo' },
                { label: 'Mais utilizados', value: 'uso' },
              ]}
            />
          </View>
          </View>
          <TouchableOpacity style={styles.botaoCadastrar} onPress={handleAbrirModal}>
            <Ionicons name="add-circle" size={20} color={colors.branco} style={{ marginRight: 6 }} />
            <Text style={styles.textoCadastrar}>Cadastrar novo voucher</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={vouchersGerados}
          keyExtractor={(_, i) => i.toString()}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const total = item.quantidade;
            const usados = total - item.codigos.length;
            const percentual = total > 0 ? (usados / total) * 100 : 0;
            const corFundo = percentual === 100 ? '#f5f5f5' : percentual > 0 ? '#fffbe5' : '#e6ffed';
            const corBorda = percentual === 100 ? '#ccc' : percentual > 0 ? '#f0c674' : '#6acc8b';
            return (
              <View style={[styles.card, { backgroundColor: corFundo, borderLeftColor: corBorda }]}>
                <Text style={styles.cardTitulo}>{item.tipo}</Text>
                <Text style={styles.cardInfo}>🧾 Produtos: {item.produtos.join(', ')}</Text>
                <Text
                  style={[
                    styles.cardInfo,
                    new Date(item.dataValidade) < new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) && {
                      color: colors.erro,
                    },
                  ]}
                >
                  📅 Validade: {new Date(item.dataValidade).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.cardInfo}>🏢 Empresa: {item.empresa}</Text>
                <Text style={styles.cardInfo}>📍 Endereço: {item.endereco}</Text>
                <Text style={styles.cardInfo}>🔁 Adquiridos: {usados} de {total}</Text>
                <Text style={styles.cardInfo}>🔑 Último código: {item.codigos[item.codigos.length - 1] || '---'}</Text>
              </View>
            );
          }}
        />

        <View style={{ height: 100 }}/>
      </View>
    </View>

    {/* Modal de Cadastro */}
    <Modal visible={modalVisible} animationType="slide">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
         <ScrollView
      contentContainerStyle={styles.modalContent}
      keyboardShouldPersistTaps="handled"
    >
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Gerar Voucher</Text>

            <SelectField
              label="Tipo de voucher"
              selectedValue={tipo}
              onValueChange={(valor) => {
                setTipo(valor);
                setErros((prev) => ({ ...prev, tipo: undefined }));
              }}
              options={[
                { label: 'Alimentação', value: 'Alimentacao' },
                { label: 'Higiene', value: 'Higiene' },
                { label: 'Transporte', value: 'Transporte' },
              ]}
              error={erros.tipo}
            />

            {tipo && produtosPorTipo[tipo] && (
              <View style={styles.produtosContainer}>
                {produtosPorTipo[tipo].map((prod) => (
                  <TouchableOpacity
                    key={prod}
                    onPress={() => {
                      const atualizados = produtos.includes(prod)
                        ? produtos.filter((p) => p !== prod)
                        : [...produtos, prod];
                      setProdutos(atualizados);
                      setErros((prev) => ({ ...prev, produtos: undefined }));
                    }}
                    style={[styles.produtoItem, produtos.includes(prod) && styles.produtoSelecionado]}
                  >
                    <Text style={produtos.includes(prod) && { fontWeight: 'bold' }}>{prod}</Text>
                  </TouchableOpacity>
                ))}
                {erros.produtos && <Text style={styles.erroTexto}>{erros.produtos}</Text>}
              </View>
            )}

            <InputField
              label="Quantidade"
              value={quantidade}
              onChangeText={(valor) => {
                setQuantidade(valor);
                setErros((prev) => ({ ...prev, quantidade: undefined }));
              }}
              keyboardType="numeric"
              error={erros.quantidade}
              placeholder="Entre 1 e 20"
            />

            <InputField
              label="Data de validade"
              value={dataValidade}
              onChangeText={(valor) => {
                setDataValidade(valor);
                setErros((prev) => ({ ...prev, dataValidade: undefined }));
              }}
              placeholder="dd/mm/aaaa"
              mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
              error={erros.dataValidade}
            />

            <View style={styles.botoesBox}>
              <BotaoVerde
                texto="Gerar Voucher"
                onPress={async () => {
                  const [dia, mes, ano] = dataValidade.split('/');
                  const dataFormatada = new Date(`${ano}-${mes}-${dia}T00:00:00`);

                  const dados = {
                    tipo,
                    produtos,
                    quantidade,
                    dataValidade: dataFormatada,
                  };

                  const errosValidacao = validarCamposObrigatorios(dados, ['tipo', 'produtos', 'quantidade', 'dataValidade']);

                  const hoje = new Date();
                  const minValidade = new Date();
                  minValidade.setDate(hoje.getDate() + 10);

                  if (isNaN(dataFormatada)) {
                    errosValidacao.dataValidade = 'Data inválida';
                  } else if (dataFormatada < minValidade) {
                    errosValidacao.dataValidade = 'Validade deve ser no mínimo 10 dias à frente';
                  }

                  if (Object.keys(errosValidacao).length > 0) {
                    setErros(errosValidacao);
                    return;
                  }

                  await apiMock.gerarVouchersPJ(usuario.cnpj, {
                    tipo,
                    produtos,
                    quantidade: parseInt(quantidade),
                    dataValidade: dataFormatada.toISOString(),
                  });

                  setModalVisible(false);
                  setModalSucesso(true);
                  setTipo('');
                  setProdutos([]);
                  setQuantidade('');
                  setDataValidade('');
                  setErros({});
                  carregarVouchers();
                }}
              />

              <BotaoVerde
                texto="Cancelar"
                onPress={() => setModalVisible(false)}
                style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.erro }}
                textoStyle={{ color: colors.erro }}
              />
            </View>
          </View>
        </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <ModalSucesso
        visivel={modalSucesso}
        onFechar={() => setModalSucesso(false)}
        mensagem="Voucher gerado com sucesso."
     />
  </>
);} 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl,
    minHeight: height,
  },
  contentBox: {
    width: width > 700 ? '60%' : '100%',
  },
  boxResumo: {
  backgroundColor: colors.branco,
  borderRadius: 16,
  padding: spacing.sm,
  marginBottom: spacing.md,
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 3,
  elevation: 2,
},

  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  subtitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
    textAlign: 'center',
    color: colors.verdeEscuro,
    marginBottom: spacing.lg,
  },
 filtrosLinha: {
  flexDirection: 'row',
  flexWrap: 'wrap',      
  justifyContent: 'center',
  gap: spacing.sm,       
  marginBottom: spacing.sm,
},

botaoFiltroBox: {
  marginBottom: spacing.xs,
},
  linhaAcao: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.md,
    flexWrap: 'wrap',
  },
  ordenarBox: {
    flex: 1,
    minWidth: 180,
  },
  botaoCadastrar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.verdeEscuro || colors.verde,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderRadius: 10,
  },
  textoCadastrar: {
    color: colors.branco,
    fontWeight: 'bold',
    fontSize: fonts.size.sm,
  },
  card: {
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderLeftWidth: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.xs,
  },
  cardInfo: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
  },
  modalContent: {
    backgroundColor: colors.fundo,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  modalBox: {
    backgroundColor: colors.fundo,
    borderRadius: 12,
    padding: spacing.lg,
    width: width > 600 ? '60%' : '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  modalTitulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  produtosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: spacing.sm,
    justifyContent: 'center',
  },
  produtoItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    margin: 4,
    borderWidth: 1,
    borderColor: colors.cinzaClaro,
    borderRadius: 8,
    backgroundColor: colors.branco,
  },
  produtoSelecionado: {
    backgroundColor: colors.verdeClaro,
    borderColor: colors.verde,
  
  },
  erroTexto: {
    color: colors.erro,
    fontSize: fonts.size.xs,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  botoesBox: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
});
