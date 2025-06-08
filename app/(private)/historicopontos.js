import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import BotaoVerde from '../../components/BotaoVerde';
import BotaoVerdePequeno from '../../components/BotaoVerdePequeno';

export default function HistoricoPontos() {
  const { usuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [filtro, setFiltro] = useState('todos');
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [itensPorPagina] = useState(5);
  const [carregandoMais, setCarregandoMais] = useState(false);


 const carregarMais = () => {
  if (carregandoMais) return; 
  setCarregandoMais(true);
  setTimeout(() => {
    setMostrarTodos(true);
    setCarregandoMais(false);
  }, 300);
};

 const verMenos = () => {
  if (carregandoMais) return;
  setCarregandoMais(true);
  setTimeout(() => {
    setMostrarTodos(false);
    setCarregandoMais(false);
  }, 300);
};


  const opcoesFiltro = [
    'todos',
    'entrada',
    'vouchers adquiridos',
    'vouchers utilizados',
    'vouchers expirados',
  ];

  useEffect(() => {
    if (!usuario?.cpf) return;

    const carregar = async () => {
      try {
        setCarregando(true);
        const user = await api.obterUsuarioPorCPF(usuario.cpf);
        const movs = (user.movimentacoes || []).sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setHistorico(movs);
        setPontos(user.pontos || 0);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, [usuario]);

  const totalEntradas = historico.filter((h) => h.tipo === 'entrada').length;
  const totalSaidas = historico.filter((h) => h.tipo === 'saida' && h.status === 'valido').length;
  const totalUtilizados = historico.filter((h) => h.tipo === 'saida' && h.status === 'utilizado').length;
  const totalExpirados = historico.filter((h) => h.tipo === 'saida' && h.status === 'expirado').length;

  const filtrar = (item) => {
    const textoBusca = busca.toLowerCase();
    const atendeBusca =
      item.descricao?.toLowerCase().includes(textoBusca) ||
      item.codigo?.toLowerCase().includes(textoBusca);

    if (!atendeBusca) return false;

    switch (filtro) {
      case 'entrada': return item.tipo === 'entrada';
      case 'vouchers adquiridos': return item.tipo === 'saida' && item.status === 'valido';
      case 'vouchers utilizados': return item.tipo === 'saida' && item.status === 'utilizado';
      case 'vouchers expirados': return item.tipo === 'saida' && item.status === 'expirado';
      default: return true;
    }
  };

  const dadosFiltrados = historico.filter(filtrar);
  const dadosPaginados = mostrarTodos ? dadosFiltrados : dadosFiltrados.slice(0, itensPorPagina);
  const temMais = dadosFiltrados.length > dadosPaginados.length;

  const renderItem = ({ item }) => {
    const isVoucher = item.tipo === 'saida';
    const corStatus =
      item.status === 'utilizado' ? colors.cinzaEscuro :
      item.status === 'expirado' ? colors.erro :
      item.status === 'valido' ? colors.sucesso : colors.cinza;

    const iconeStatus =
      item.status === 'utilizado' ? '❌' :
      item.status === 'expirado' ? '⏳' :
      item.status === 'valido' ? '✅' : 'ℹ️';

    return (
      <View style={[styles.card, isVoucher ? styles.voucher : styles.ponto]}>
        <Text style={styles.data}>📅 {item.data}</Text>
        <Text style={styles.pontos}>{item.tipo === 'entrada' ? '+' : '-'}{item.pontos} pontos</Text>
        <Text style={styles.descricao}>
          {item.tipo === 'entrada'
            ? item.descricao
            : `Troca por voucher de ${item.tipoVoucher || 'benefício'}`}
        </Text>
        {item.codigo && <Text style={styles.comparativo}>🔑 Código: {item.codigo}</Text>}
        {item.produtos && <Text style={styles.info}>📦 Produtos: {item.produtos.join(', ')}</Text>}
        {item.empresa && <Text style={styles.info}>🏢 Empresa: {item.empresa}</Text>}
        {item.endereco && <Text style={styles.info}>📍 Endereço: {item.endereco}</Text>}
        {item.validade && <Text style={styles.info}>📅 Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}</Text>}
        {item.status && <Text style={[styles.info, { color: corStatus }]}>{iconeStatus} Status: {item.status}</Text>}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
        <View style={styles.topoInfo}>
          <Text style={styles.titulo}>Histórico Pontos e Vouchers</Text>
          <Text style={styles.subtitulo}>Total de pontos disponíveis: {pontos}</Text>
          <Text style={styles.resumo}>
            ➕ Entradas: {totalEntradas}  ·  
            🎁 Vouchers: {totalSaidas}                                                       ·  
            ✅ Utilizados: {totalUtilizados}  ·  
            ⏰ Expirados: {totalExpirados}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtrosLinhaHorizontal}
          >
            {opcoesFiltro.map((f) => (
              <View key={f} style={styles.botaoFiltroHorizontal}>
                <BotaoVerdePequeno
                  texto={f.charAt(0).toUpperCase() + f.slice(1)}
                  onPress={() => setFiltro(f)}
                  ativo={filtro === f}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        <TextInput
          placeholder="Buscar..."
          value={busca}
          onChangeText={setBusca}
          style={styles.campoBusca}
        />

        {carregando ? (
          <Text style={[styles.vazio, { fontStyle: 'italic' }]}>⏳ Carregando histórico...</Text>
        ) : dadosPaginados.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma movimentação encontrada.</Text>
        ) : (
          dadosPaginados.map((item, index) => (
            <View key={index}>{renderItem({ item })}</View>
          ))
        )}

        {!carregando && historico.length > 3 && (
          <View style={styles.botaoContainer}>
          {!mostrarTodos && temMais && (
              <BotaoVerde texto="Ver mais ▼" onPress={carregarMais} carregando={carregandoMais} />
            )}

            {(mostrarTodos || (!temMais && historico.length > itensPorPagina)) && (
              <BotaoVerde texto="Ver menos ▲" onPress={verMenos} carregando={carregandoMais} />
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentBox: {
    width: '100%',
    maxWidth: 700,
    alignSelf: 'center',
  },
  topoInfo: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    marginBottom: spacing.sm,
    paddingTop: spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
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
    color: colors.verde,
    textAlign: 'center',
    fontWeight: fonts.weight.bold,
  },
  resumo: {
    textAlign: 'center',
    fontSize: fonts.size.sm,
    color: colors.cinzaEscuro,
    marginVertical: spacing.md,
  },
  vazio: {
    textAlign: 'center',
    color: colors.cinza,
    fontSize: fonts.size.sm,
    marginTop: spacing.md,
  },
  card: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ponto: {
    backgroundColor: '#f0fff0',
    borderWidth: 1,
    borderColor: colors.sucesso,
  },
  voucher: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: colors.erro,
  },
  data: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    marginBottom: 4,
  },
  pontos: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
    color: colors.preto,
  },
  descricao: {
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
    color: colors.preto,
    marginBottom: 2,
  },
  comparativo: {
    fontSize: fonts.size.sm,
    color: colors.verde,
  },
  info: {
    fontSize: fonts.size.sm,
    color: colors.cinzaEscuro,
    marginTop: 2,
  },
  filtrosLinhaHorizontal: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
  },
  botaoFiltroHorizontal: {
    marginRight: spacing.sm,
  },
  campoBusca: {
    backgroundColor: colors.branco,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 6,
    fontSize: fonts.size.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
    width: '100%',
  },
  botaoContainer: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
});
