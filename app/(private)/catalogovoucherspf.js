// CatalogoVouchersPF.js com fundo branco e sem ScrollView duplicado (ajustado para PrivateLayout)

import { useRouter } from 'expo-router';
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
  TouchableOpacity,
  View,
} from 'react-native';
import BotaoVerde from '../../components/BotaoVerde';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';
import ModalSucesso from '../../components/ModalSucesso';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';

const { width, height } = Dimensions.get('window');
const tipos = ['Alimentacao', 'Transporte', 'Higiene'];

export default function CatalogoVouchersPF() {
  const { usuario } = useAuth();
  const router = useRouter();
  const [vouchers, setVouchers] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [modalMensagem, setModalMensagem] = useState(null);
  const [modalSucesso, setModalSucesso] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('Alimentacao');
  const [saldoAtual, setSaldoAtual] = useState(0);


useEffect(() => {
  carregarVouchers();
  carregarSaldoAtualizado();
}, []);


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


  const alternarSelecao = (lote) => {
    const id = lote.codigos[0];
    const existe = selecionados.find((v) => v.loteId === id);

    if (existe) {
      setSelecionados(selecionados.filter((v) => v.loteId !== id));
    } else {
      setSelecionados([
        ...selecionados,
        {
          loteId: id,
          codigo: id,
          tipo: lote.tipo,
          produtos: lote.produtos,
          empresa: lote.empresa,
          endereco: lote.endereco,
          validade: lote.validade,
          pontos: lote.pontos,
          quantidade: 1,
          codigos: lote.codigos,
        },
      ]);
    }
  };

  const totalPontos = selecionados.reduce(
    (acc, item) => acc + item.pontos * item.quantidade,
    0
  );

 const finalizarCompra = async () => {
  try {
    const listaFinal = selecionados.flatMap((item) => {
      const codigosUsados = item.codigos.slice(0, item.quantidade);
      return codigosUsados.map((codigo) => ({
        codigo,
        tipo: item.tipo,
        produtos: item.produtos,
        empresa: item.empresa,
        endereco: item.endereco,
        validade: item.validade,
        pontos: item.pontos,
      }));
    });

    await api.comprarVouchersPF(usuario.cpf, listaFinal);


      setTimeout(async () => {
      await carregarVouchers(); 

      const atual = await api.obterUsuarioPorCPF(usuario.cpf);
      const novoSaldo = atual.pontos;
      setSaldoAtual(novoSaldo); 

      setSelecionados([]);
      setModalVisivel(false);

      setModalMensagem({
        titulo: 'Compra realizada com sucesso! 🎉',
        conteudo: (
          <ScrollView>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Vouchers adquiridos:</Text>
            {listaFinal.map((v, idx) => (
              <Text key={idx}>• {v.tipo} – {v.codigo}</Text>
            ))}
            <Text style={{ fontWeight: 'bold', marginTop: 12 }}>
              Novo saldo: {novoSaldo} pontos
            </Text>
            <Text style={{ marginTop: 10 }}>
              Vá até o histórico de pontos para ver os vouchers adquiridos.
            </Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                padding: 10,
                borderRadius: 8,
                
                marginTop: 16,
                alignItems: 'center'
              }}
              onPress={() => router.push('/(private)/historicopontos')}
            >
              <Text style={{ color: 'white', fontWeight: 'bold' }}>Ir para o Histórico</Text>
            </TouchableOpacity>
          </ScrollView>
        )
      });
    }, 300); // espera 300ms para garantir leitura correta do AsyncStorage

  } catch (error) {
    setModalVisivel(false);
    setSelecionados([]);
    setModalMensagem({
      titulo: 'Pontos insuficientes',
      conteudo: (
        <Text>
          Você não possui pontos suficientes para realizar esta compra.
          Faça novos depósitos de materiais para acumular mais pontos.
        </Text>
      ),
    });
  }
};

  const limparSelecao = () => setSelecionados([]);
  const filtrarPorTipo = () => tipoSelecionado === 'Todos' ? vouchers : vouchers.filter((v) => v.tipo === tipoSelecionado);
  const corFundoPorTipo = (tipo) => {
    switch (tipo) {
      case 'Alimentacao': return '#fffbe6';
      case 'Higiene': return '#e6f7ff';
      case 'Transporte': return '#e6ffe6';
      default: return colors.branco;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.boxResumo}>
          <Text style={styles.titulo}>Catálogo de Vouchers</Text>
          <Text style={styles.subtitulo}>Troque seus pontos por produtos!</Text>
          <Text style={styles.saldo}>🥇 Saldo atual: {saldoAtual} pontos</Text>

          <View style={styles.filtrosLinha}>
            {tipos.map((tipo) => (
              <BotaoVerdePequeno
                key={tipo}
                texto={tipo}
                onPress={() => setTipoSelecionado(tipo)}
                ativo={tipo === tipoSelecionado}
              />
            ))}
          </View>
        </View>

        <FlatList
          data={filtrarPorTipo()}
          keyExtractor={(item) => item.codigos[0]}
          scrollEnabled={false}
          renderItem={({ item }) => {
            const selecionado = selecionados.find((v) => v.loteId === item.codigos[0]);
            return (
              <TouchableOpacity
                onPress={() => alternarSelecao(item)}
                style={[styles.card, { backgroundColor: corFundoPorTipo(item.tipo) }, selecionado && styles.cardSelecionado]}
              >
                <Text style={styles.cardTitulo}>{item.tipo}</Text>
                <Text style={styles.cardInfo}>🥫 Produtos: {item.produtos.join(', ')}</Text>
                <Text style={styles.cardInfo}>🏢 Empresa: {item.empresa}</Text>
                <Text style={styles.cardInfo}>📍 Endereço: {item.endereco}</Text>
                <Text style={styles.cardInfo}>📅 Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.cardInfo}>🎯 Pontos: {item.pontos}</Text>
                <Text style={styles.cardInfo}>🔢 Disponíveis: {item.codigos.length}</Text>
                {selecionado && (
                  <Text style={styles.cardSelecionadoTexto}>✅ Selecionado: {selecionado.quantidade}x</Text>
                )}
              </TouchableOpacity>
            );
          }}
        />

        {selecionados.length > 0 && (
          <View style={styles.rodapeBox}>
            <Text style={styles.totalTexto}>Total: {totalPontos} pontos</Text>
            <View style={styles.botoesBox}>
              <BotaoVerde texto="Finalizar Compra" onPress={() => setModalVisivel(true)} />
              <BotaoVerde texto="Limpar Seleção" onPress={limparSelecao} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.erro }} textoStyle={{ color: colors.erro }} />
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </View>

      {/* Modais mantidos conforme o original */}
      <Modal visible={modalVisivel} animationType="fade" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>Confirmação da Compra</Text>
            <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
              {selecionados.map((item) => (
                <View key={item.loteId} style={styles.cardResumo}>
                  <Text style={styles.cardInfo}>Tipo: {item.tipo}</Text>
                  <Text style={styles.cardInfo}>Produtos: {item.produtos.join(', ')}</Text>
                  <Text style={styles.cardInfo}>Empresa: {item.empresa}</Text>
                  <Text style={styles.cardInfo}>Endereço: {item.endereco}</Text>
                  <Text style={styles.cardInfo}>Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</Text>
                  <Text style={styles.cardInfo}>Quantidade: {item.quantidade}</Text>
                  <Text style={styles.cardInfo}>Pontos: {item.pontos * item.quantidade}</Text>
                </View>
              ))}
              <Text style={styles.totalTexto}>Total: {totalPontos} pontos</Text>
            </ScrollView>
            <View style={styles.botoesBox}>
              <BotaoVerde texto="Confirmar" onPress={finalizarCompra} />
              <BotaoVerde texto="Cancelar" onPress={() => setModalVisivel(false)} style={{ backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.erro }} textoStyle={{ color: colors.erro }} />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <ModalSucesso visivel={modalSucesso} onFechar={() => setModalSucesso(false)} mensagem="Compra realizada com sucesso!" />

      <Modal visible={!!modalMensagem} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitulo}>{modalMensagem?.titulo}</Text>
            <ScrollView style={{ maxHeight: height * 0.45, marginVertical: spacing.sm }}>
              {modalMensagem?.conteudo}
            </ScrollView>
            <BotaoVerde texto="Fechar" onPress={() => setModalMensagem(null)} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  contentBox: {
    width: width > 700 ? '70%' : '100%',
    alignSelf: 'center',
  },
  boxResumo: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  titulo: {
    marginTop:spacing.md,
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    textAlign: 'center',
    color: colors.verde,
    marginBottom: spacing.md,
  },
  saldo: {
  textAlign: 'center',
  fontSize: fonts.size.md,
  fontWeight: fonts.weight.bold,
  color: colors.verde,
  marginBottom: spacing.md,
},

  filtrosLinha: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm,
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
    flexWrap: 'wrap',
  },
  cardSelecionadoTexto: {
    marginTop: spacing.xs,
    color: colors.verdeEscuro,
    fontWeight: 'bold',
  },
  rodapeBox: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.branco,
    borderTopWidth: 1,
    borderColor: colors.cinzaClaro,
    alignItems: 'center',
  },
  botoesBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    flexWrap: 'wrap',
  },
  totalTexto: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
    color: colors.textDark,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
  },
  modalBox: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    padding: spacing.lg,
    width: width > 600 ? '60%' : '90%',
    maxHeight: height * 0.75,
    elevation: 4,
    justifyContent: 'center',
  },
  modalTitulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
    color: colors.verde,
  },
  cardResumo: {
    marginBottom: spacing.sm,
  },
});
