import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useMemo } from 'react';
import {
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import BotaoVerde from '../../components/BotaoVerde';
import Badge from '../../components/Badge.js';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';
import InputField from '../../components/InputField';
import ModalSucesso from '../../components/ModalSucesso';
import ModalErro from '../../components/ModalErro';
import SelectField from '../../components/SelectField';
import { useAuth } from '../../context/AuthContext';
import { VouchersService } from '../../services/vouchersService';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import VerMaisMenos from '../../components/VerMaisMenos';
import { obterStatus, textoStatus,corStatus,obterMensagemErro } from '../../utils/status';

const { width, height } = Dimensions.get('window');


const produtosPorTipo = {
  Alimentacao: ['Marmitex', 'Arroz 5kg', 'Feijão 1kg', 'Leite integral', 'Cesta básica'],
  Higiene: ['Pasta dental Colgate', 'Sabonete Dove', 'Papel higiênico', 'Shampoo', 'Sabão em barra'],
  Transporte: ['Metrô', 'Ônibus'],
};




export default function CatalogoRecompensaPJ() {
  const { usuario } = useAuth();
  const [filtroStatus, setFiltroStatus] = useState('todos');
  const [criterioOrdenacao, setCriterioOrdenacao] = useState('validade');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalSucesso, setModalSucesso] = useState(false);

  const [tipo, setTipo] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [quantidade, setQuantidade] = useState('');
  const [dataValidade, setDataValidade] = useState('');

  const [erros, setErros] = useState({});
  const [vouchersGerados, setVouchersGerados] = useState([]);
  const [qtdAdquiridos, setQtdAdquiridos] = useState(0);
  const [adquiridosPorLote, setAdquiridosPorLote] = useState({});


  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');
  const [gerandoVoucher, setGerandoVoucher] = useState(false);
  const [modalInfo, setModalInfo] = useState(false);
  const itensPorPagina = 5;
  
 const formatarData = (data) => {
  if (!data) return '---';

  try {
    // Remove hora, se existir
    const dataLimpa = data.includes('T') ? data.split('T')[0] : data;
    const partes = dataLimpa.split('-');

    if (partes.length === 3) {
      const [ano, mes, dia] = partes;
      return `${dia}/${mes}/${ano}`;
    }

    return data;
  } catch (error) {
    return data;
  }
};


const carregarDados = async () => {
  try {
    const [vouchers, estatisticas] = await Promise.all([
      VouchersService.listarVouchers(),
      VouchersService.obterEstatisticas(),
    ]);
    setVouchersGerados(vouchers);
    setQtdAdquiridos(estatisticas.totalComprados);
    setAdquiridosPorLote(estatisticas.porLote);
  } catch (error) {
    const mensagem = obterMensagemErro(error, 'Erro ao carregar dados.');
    setMensagemErro(mensagem);
    setErroVisivel(true);
  }
};

useEffect(() => {
  if (usuario) carregarDados();
}, [usuario]);


  const handleAbrirModal = () => {
    setTipo('');
    setProdutos([]);
    setQuantidade('');
    setDataValidade('');
    setErros({});
    setModalVisible(true);
  };

  const handleGerarVoucher = async () => {
  const partesData = dataValidade.split('/');
  if (partesData.length !== 3) {
    setErros((prev) => ({ ...prev, dataValidade: 'Data inválida' }));
    return;
  }

  const [dia, mes, ano] = partesData;
  const validadeFormatada = `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`;

  if (gerandoVoucher) return;

    const dados = {
      tipo,
      produtos,
      quantidade,
      dataValidade,
    };

    const errosValidacao = validarCamposObrigatorios(
      dados,
      ['tipo', 'produtos', 'quantidade', 'dataValidade']
    );

    if (Object.keys(errosValidacao).length > 0) {
      setErros(errosValidacao);
      return;
    }

    setGerandoVoucher(true);

    try {
      await VouchersService.gerarVoucher({
        tipo,
        produtos,
        quantidade: parseInt(quantidade),
        dataValidade: validadeFormatada,
      });

      setModalVisible(false);
      setModalSucesso(true);
      setTipo('');
      setProdutos([]);
      setQuantidade('');
      setDataValidade('');
      setErros({});
     carregarDados();
    } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao gerar voucher.');
      setMensagemErro(mensagem);
      setErroVisivel(true);
    }
 finally {
      setGerandoVoucher(false);
    }
  };

  const vouchersFiltrados = useMemo(() => {
  return vouchersGerados
    .filter((item) => {
      const status = obterStatus(item);
      if (filtroStatus === 'validos') return status === 'validos';
      if (filtroStatus === 'expirado') return status === 'expirado';
      return true; // 'todos'
    })
    .sort((a, b) => {
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
}, [vouchersGerados, filtroStatus, criterioOrdenacao]);


  const totalLotes = vouchersFiltrados.length;
  const totalVouchers = vouchersFiltrados.reduce((acc, v) => acc + v.quantidade, 0);
  const qtdAtivos = totalVouchers - qtdAdquiridos;

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.boxResumo}>
            <Text style={styles.titulo}>Histórico de Vouchers Emitidos</Text>
            <Text style={styles.subtitulo}>
              🧾 Lotes: {totalLotes} · ✅ Ativos: {qtdAtivos} · 🔁 Adquiridos: {qtdAdquiridos}
            </Text>

            <View style={styles.filtrosLinha}>
             {['todos', 'validos', 'expirado'].map((value) => (
            <View key={value} style={styles.botaoFiltroBox}>
              <BotaoVerdePequeno
                texto={textoStatus[value]}
                onPress={() => setFiltroStatus(value)}
                ativo={filtroStatus === value}
              />
            </View>
            ))}
             <TouchableOpacity onPress={() => setModalInfo(true)}>
              <Ionicons name="information-circle-outline" size={20} color={colors.verdeEscuro} />
              <Text style={{color: colors.verdeEscuro, marginLeft: 4}}></Text>
              </TouchableOpacity>
          </View>

          <View style={styles.linhaAcao}>
            <View style={styles.ordenarBox}>
              <SelectField
                label="Ordenar por:"
                selectedValue={criterioOrdenacao}
                onValueChange={setCriterioOrdenacao}
                options={[
                  { label: 'Validade (mais próximas)', value: 'validade' },
                  { label: 'Tipo (A-Z)', value: 'tipo' },
                  { label: 'Mais utilizados', value: 'uso' },
                ]}
              />
            </View>

            <TouchableOpacity style={styles.botaoCadastrar} onPress={handleAbrirModal}>
              <Ionicons name="add-circle" size={20} color={colors.branco} />
              <Text style={styles.textoCadastrar}>Cadastrar novo voucher</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={mostrarTodos ? vouchersFiltrados : vouchersFiltrados.slice(0, itensPorPagina)}
          keyExtractor={(item) => item.idLote}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const total = item.quantidade;
            const usados = adquiridosPorLote[item.idLote] || 0;

            const percentual = total > 0 ? (usados / total) * 100 : 0;
            const corFundo = percentual === 100 ? '#f5f5f5' : percentual > 0 ? '#fffbe5' : '#e6ffed';
            const corBorda = percentual === 100 ? '#ccc' : percentual > 0 ? '#f0c674' : '#6acc8b';
            const status = obterStatus(item);

              
            return (
              <View style={[styles.card, { backgroundColor: corFundo, borderLeftColor: corBorda }]}>
                <View style={styles.headerCard}>
                  <Text style={styles.cardTitulo}>{item.tipo}</Text>
                  <Badge
                    texto={textoStatus[obterStatus(item)]}
                    corFundo={corStatus[obterStatus(item)]}
                  />
                </View>
                <Text style={styles.cardInfo}>🧾 Produtos: {item.produtos.join(', ')}</Text>
                <Text style={styles.cardInfo}>
                  📅 Validade: {formatarData(item.dataValidade)}
                </Text>
                <Text style={styles.cardInfo}>🏢 Empresa: {item.empresa}</Text>
                <Text style={styles.cardInfo}>📍 Endereço: {item.endereco}</Text>
                <Text style={styles.cardInfo}>
                  🔁 Adquiridos: {adquiridosPorLote[item.idLote] || 0} de {item.quantidade}
                </Text>

                <Text style={styles.cardInfo}>
                  🔑 Último código: {item.codigos[item.codigos.length - 1] || '---'}
                </Text>
              </View>
            );
          }}
        />

        {vouchersFiltrados.length > itensPorPagina && (
          <VerMaisMenos
            temMais={vouchersFiltrados.length > itensPorPagina}
            mostrarTodos={mostrarTodos}
            onVerMais={() => setMostrarTodos(true)}
            onVerMenos={() => setMostrarTodos(false)}
          />
        )}
      </View>
      <Modal
        visible={modalInfo}
        transparent
        animationType="fade"
        onRequestClose={() => setModalInfo(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.box}>
            <Text style={styles.modalTitulo}>Legenda dos Status</Text>
            <Text style={styles.modalInfo}>✅ Válido: Lote ativo, sem vouchers utilizados.</Text>
            <Text style={styles.modalInfo}>⚠️ Parcial: Parte dos vouchers já adquiridos.</Text>
            <Text style={styles.modalInfo}>❌ Expirado: Lote cuja validade já passou.</Text>

            <TouchableOpacity onPress={() => setModalInfo(false)} style={styles.botaoFechar}>
              <Text style={styles.textoFechar}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>


      {/* Modal de geração */}
      <Modal visible={modalVisible} animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.modalContent}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitulo}>Gerar Voucher</Text>

              <SelectField
                label="Tipo de voucher"
                selectedValue={tipo}
                onValueChange={(valor) => {
                  setTipo(valor);
                  setProdutos([]);
                  setErros((prev) => ({ ...prev, tipo: undefined, produtos: undefined }));
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
                      style={[
                        styles.produtoItem,
                        produtos.includes(prod) && styles.produtoSelecionado,
                      ]}
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
                  texto={gerandoVoucher ? 'Gerando...' : 'Gerar Voucher'}
                  onPress={handleGerarVoucher}
                  disabled={gerandoVoucher}
                />

                <BotaoVerde
                  texto="Cancelar"
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderColor: colors.erro,
                  }}
                  textoStyle={{ color: colors.erro }}
                />
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />

      <ModalSucesso
        visivel={modalSucesso}
        onFechar={() => setModalSucesso(false)}
        mensagem="Voucher gerado com sucesso."
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: spacing.xl,
    minHeight: height,
    alignItems: 'center',
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
    marginLeft: 6,
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
    minHeight: height,
  },
  modalBox: {
    backgroundColor: colors.branco,
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
    justifyContent: 'center',
    marginVertical: spacing.sm,
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
  headerCard: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

statusBadge: {
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
  alignSelf: 'flex-start',
},

statusTexto: {
  color: colors.branco,
  fontSize: fonts.size.xs,
  fontWeight: 'bold',
},

overlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.6)',
  justifyContent: 'center',
  alignItems: 'center',
},

box: {
  backgroundColor: colors.branco,
  padding: spacing.lg,
  borderRadius: 12,
  width: '80%',
},

modalInfo: {
  fontSize: fonts.size.sm,
  marginBottom: spacing.sm,
  color: colors.textDark,
},

botaoFechar: {
  marginTop: spacing.md,
  backgroundColor: colors.verde,
  padding: spacing.sm,
  borderRadius: 8,
  alignSelf: 'center',
},

textoFechar: {
  color: colors.branco,
  fontWeight: 'bold',
},


});
