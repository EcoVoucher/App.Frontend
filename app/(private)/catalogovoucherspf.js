import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useCarrinho } from '../../context/CarrinhoContext';
import { useAuth } from '../../context/AuthContext';
import { useModalCarrinho } from '../../context/ModalCarrinhoContext';
import api from '../../services/apiMock';
import BotaoVerde from '../../components/BotaoVerde';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';
import ModalSucesso from '../../components/ModalSucesso';
import ModalErro from '../../components/ModalErro';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import VerMaisMenos from '../../components/VerMaisMenos';
import Badge from '../../components/Badge';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';




const { width, height } = Dimensions.get('window');
const tipos = ['Todos', 'Alimentacao', 'Transporte', 'Higiene'];


export default function CatalogoVouchersPF() {  
  const { usuario } = useAuth();
  const router = useRouter();
  const { mostrarResumo, abrirResumo, fecharResumo } = useModalCarrinho();

  const [vouchers, setVouchers] = useState([]);
  const [modalSucesso, setModalSucesso] = useState({titulo: '', conteudo: null});
  const [modalErro, setModalErro] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState('Alimentacao');
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [comprando, setComprando] = useState(false);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const itensPorPagina = 4;

  const {
    selecionados,
    alternarSelecao,
    limparCarrinho,
    totalPontos,
  } = useCarrinho();

  const carregarSaldoAtualizado = async () => {
    const user = await api.obterUsuarioPorCPF(usuario.cpf);
    setSaldoAtual(user.pontos || 0);
  };

  const carregarVouchers = async () => {
    const lista = await api.obterVouchersDisponiveisPF();
    setVouchers(lista);
    const atual = await api.obterUsuarioPorCPF(usuario.cpf);
    setSaldoAtual(atual.pontos || 0);
  };

  const abrirModalResumo = () => {
    if (selecionados.length === 0) {
      setModalErro('Selecione ao menos um voucher para continuar.');
      return;
    }
    abrirResumo();
  };
  useFocusEffect(
    useCallback(() => {
      const atualizar = async () => {
        await carregarSaldoAtualizado();
        await carregarVouchers();
      };

      atualizar();
    }, [])
  );
  

  const finalizarCompra = async () => {
  if (comprando) return;

  if (totalPontos > saldoAtual) {
    setModalErro('Você não possui pontos suficientes para essa compra.');
    limparCarrinho();
    fecharResumo();
    return;
  }

  setComprando(true);
  try {
    const listaFinal = selecionados.map((item) => ({
      idLote: item.idLote,
      tipo: item.tipo,
      produtos: item.produtos,
      empresa: item.empresa,
      endereco: item.endereco,
      validade: item.validade,
      pontos: item.pontos,
    }));

    const resultado = await api.comprarVouchersPF(usuario.cpf, listaFinal); 

    await carregarVouchers();
    await carregarSaldoAtualizado();

    limparCarrinho();
    fecharResumo();
    setComprando(false);

    setModalSucesso({
      titulo: 'Compra realizada com sucesso! 🎉',
      conteudo: (
        <>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
            Vouchers adquiridos:
          </Text>
         {listaFinal.map((v, idx) => (
              <Text key={idx}>
                • {v.tipo} – {resultado.codigos?.[idx] || 'Sem código'}
              </Text>
            ))}
          <Text style={{ fontWeight: 'bold', marginTop: 12 }}>
            Novo saldo: {saldoAtual - totalPontos} pontos
          </Text>
          <Text style={{ marginTop: 10 }}>
            Vá até o histórico de pontos para ver os vouchers adquiridos.
          </Text>
          <BotaoVerde
            texto="Ir para o Histórico"
            onPress={() => {
              setModalSucesso(false);
              router.push('/(private)/historicopontos');
            }}
            style={{ backgroundColor: '#66BB6A', marginTop: 16 }}
          />
        </>
      ),
    });
  } catch (error) {
  fecharResumo();
  limparCarrinho();
  setComprando(false);

  const mensagem = error?.message || '';

  if (mensagem.includes('já adquiriu um voucher')) {
    setModalErro('Você já adquiriu este voucher. Só é permitido 1 unidade por lote.');
  } else if (mensagem.includes('Pontos insuficientes')) {
    setModalErro('Você não possui pontos suficientes para essa compra.');
  } else if (mensagem.includes('Sem códigos disponíveis')) {
    setModalErro('Este voucher está esgotado no momento.');
  } else {
    setModalErro(
      'Ocorreu um erro na compra. Tente novamente ou verifique seus pontos.'
    );
  }
}
  };


const filtrarPorTipo = () => {
  const filtrados =
    tipoSelecionado === 'Todos'
      ? vouchers
      : vouchers.filter((v) => v.tipo === tipoSelecionado);

  return mostrarTodos ? filtrados : filtrados.slice(0, itensPorPagina);
};

const temMais = () => {
  const total = tipoSelecionado === 'Todos'
    ? vouchers.length
    : vouchers.filter((v) => v.tipo === tipoSelecionado).length;

  return filtrarPorTipo().length < total;
};

  const corFundoPorTipo = (tipo) => {
    switch (tipo) {
      case 'Alimentacao':
        return '#fffbe6';
      case 'Higiene':
        return '#e6f7ff';
      case 'Transporte':
        return '#e6ffe6';
      default:
        return colors.branco;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.boxResumo}>
          <Text style={styles.titulo}>Catálogo de Vouchers</Text>
          <Text style={styles.subtitulo}>
            Troque seus pontos por produtos!
          </Text>
          <Text style={styles.saldo}>
            🥇 Saldo atual: {saldoAtual} pontos
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosLinha}
          >
            {tipos.map((tipo) => (
              <BotaoVerdePequeno
                key={tipo}
                texto={tipo}
                onPress={() => setTipoSelecionado(tipo)}
                ativo={tipo === tipoSelecionado}
              />
            ))}
          </ScrollView>

        </View>

        <FlatList
          data={filtrarPorTipo()}
          keyExtractor={(item) => item.idLote}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const selecionado = selecionados.find(
            (v) => v.idLote === item.idLote
            );
            const saldoInsuficiente = saldoAtual < item.pontos;

            return (
              <TouchableOpacity
                onPress={() => {
                  if (saldoInsuficiente) {
                    setModalErro(
                      'Saldo insuficiente para selecionar este voucher.'
                    );
                  } else {
                    alternarSelecao(item);
                  }
                }}
                style={[
                  styles.card,
                  { backgroundColor: corFundoPorTipo(item.tipo) },
                  selecionado && styles.cardSelecionado,
                ]}
              >
                 {selecionado && <Badge texto="Selecionado" />}
                <Text style={styles.cardTitulo}>{item.tipo}</Text>
                <Text style={styles.cardInfo}>
                  🥫 Produtos: {item.produtos.join(', ')}
                </Text>
                <Text style={styles.cardInfo}>
                  🏢 Empresa: {item.empresa}
                </Text>
                <Text style={styles.cardInfo}>
                  📍 Endereço: {item.endereco}
                </Text>
                <Text style={styles.cardInfo}>
                  📅 Validade:{' '}
                  {new Date(item.validade).toLocaleDateString('pt-BR')}
                </Text>
                <Text style={styles.cardInfo}>🎯 Pontos: {item.pontos}</Text>
                <Text style={styles.cardInfo}>
                  🔢 Disponíveis: {item.codigos.length}
                </Text>
                {saldoInsuficiente && (
                  <Text
                    style={{
                      color: colors.erro,
                      fontWeight: 'bold',
                      marginTop: 4,
                    }}
                  >
                    ⚠️ Saldo insuficiente
                  </Text>
                )}
                {selecionado && (
                  <Text style={styles.cardSelecionadoTexto}>
                    ✅ Selecionado
                  </Text>
                )}
              </TouchableOpacity>
            );
          }}
        />
 {vouchers.length > itensPorPagina && (
  <VerMaisMenos
    temMais={temMais()}
    mostrarTodos={mostrarTodos}
    onVerMais={() => setMostrarTodos(true)}
    onVerMenos={() => setMostrarTodos(false)}
  />
)}
        <View style={{ height: 100 }} />
      </View>

      {/* 🔥 Modal de Resumo */}
      <Modal
        visible={mostrarResumo}
        transparent
        animationType="fade"
        onRequestClose={fecharResumo}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Resumo da Compra</Text>

            <ScrollView style={{ maxHeight: 300 }}>
              {selecionados.map((item) => (
                <View key={item.idLote} style={styles.cardResumo}>
                  <Text>
                    <Text style={styles.labelNegrito}>Tipo:</Text> {item.tipo}
                  </Text>
                  <Text>
                    <Text style={styles.labelNegrito}>Produtos:</Text>{' '}
                    {item.produtos.join(', ')}
                  </Text>
                  <Text>
                    <Text style={styles.labelNegrito}>Empresa:</Text>{' '}
                    {item.empresa}
                  </Text>
                  <Text>
                    <Text style={styles.labelNegrito}>Endereço:</Text>{' '}
                    {item.endereco}
                  </Text>
                  <Text>
                    <Text style={styles.labelNegrito}>Validade:</Text>{' '}
                    {new Date(item.validade).toLocaleDateString('pt-BR')}
                  </Text>
                  <Text>
                    <Text style={styles.labelNegrito}>Pontos:</Text>{' '}
                    {item.pontos}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <Text style={styles.totalTexto}>
              Total: {totalPontos} pontos
            </Text>

            <View style={styles.botoesBox}>
              <BotaoVerde
                texto={comprando ? 'Comprando...' : 'Finalizar Compra'}
                onPress={finalizarCompra}
                disabled={comprando}
              />
              <BotaoVerde
                texto="Cancelar"
                onPress={fecharResumo}
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.erro,
                }}
                textoStyle={{ color: colors.erro }}
              />
              <BotaoVerde
                texto="Limpar Seleção"
                onPress={() => {
                  limparCarrinho();
                  fecharResumo();
                }}
                style={{
                  backgroundColor: 'transparent',
                  borderWidth: 1,
                  borderColor: colors.vermelho,
                }}
                textoStyle={{ color: colors.vermelho }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* 🔥 Modais de feedback */}
  <ModalSucesso
  visivel={!!modalSucesso.titulo}
  titulo={modalSucesso.titulo}
  mensagem={modalSucesso.conteudo}
  onFechar={() => setModalSucesso({ titulo: '', conteudo: null })}
/>
      <ModalErro
        visivel={!!modalErro}
        onClose={() => setModalErro('')}
        mensagem={modalErro}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentBox: {
    width: width > 700 ? '70%' : '100%',
    alignSelf: 'center',
  },
  boxResumo: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  saldo: {
    textAlign: 'center',
    fontSize: fonts.size.md,
    color: colors.verde,
    marginBottom: spacing.md,
  },
 filtrosLinha: {
  flexDirection: 'row',
  gap: spacing.sm,
  paddingHorizontal: spacing.sm,
},

  card: {
    padding: spacing.sm,
    borderRadius: 12,
    marginBottom: spacing.sm,
    borderLeftWidth: 6,
    borderLeftColor: colors.verde,
    backgroundColor: colors.branco,
    elevation: 2,
    width: '100%',
  },
  cardSelecionado: {
    borderColor: colors.verdeEscuro,
    borderWidth: 2,
    shadowColor: colors.verde,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
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
    marginBottom: 4,
  },
  cardSelecionadoTexto: {
    marginTop: spacing.xs,
    color: colors.verdeEscuro,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: colors.branco,
    borderRadius: 20,
    padding: spacing.lg,
    width: width > 600 ? '60%' : '90%',
    maxHeight: height * 0.75,
    elevation: 5,
  },
  modalTitulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.verde,
  },
  cardResumo: {
    marginBottom: spacing.sm,
    paddingBottom: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.cinzaClaro,
  },
  labelNegrito: {
    fontWeight: 'bold',
    color: colors.verde,
  },
  totalTexto: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  botoesBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
});
