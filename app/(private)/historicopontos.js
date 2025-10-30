import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { UsuarioService } from '../../services/usuarioService';
import HeaderComFiltros from '../../components/HeaderComFiltros';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import VerMaisMenos from '../../components/VerMaisMenos';
import ModalErro from '../../components/ModalErro';
import { apenasNumeros } from '../../utils/formatarenvio';

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

  const [erroVisivel, setErroVisivel] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const opcoesFiltro = [
    'todos',
    'entrada',
    'vouchers adquiridos',
    'vouchers utilizados',
    'vouchers expirados',
  ];

  // calcula saldo quando API não devolver "pontos"
  const calcularSaldo = (movs) => {
    return (movs || []).reduce((acc, m) => {
      if (m.tipo === 'entrada') return acc + (m.pontos || 0);
      if (m.tipo === 'saida') return acc - (m.pontos || 0); // conta qualquer saída
      return acc;
    }, 0);
  };

  const ordenarMovs = (arr) =>
    [...(arr || [])].sort((a, b) => {
      const ta = new Date(a?.timestamp || a?.data || 0).getTime();
      const tb = new Date(b?.timestamp || b?.data || 0).getTime();
      return tb - ta;
    });

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const doc = apenasNumeros(usuario?.cpf || '');
      const resp = await UsuarioService.obterPorId(doc);

      if (!resp.ok) {
        throw resp.error;
      }

      const data = resp.data;

      // Suporta os dois formatos: {pontos, movimentacoes} OU array direto
      if (data && Array.isArray(data)) {
        const movs = ordenarMovs(data);
        setHistorico(movs);
        setPontos(calcularSaldo(movs));
      } else {
        const movs = ordenarMovs(data?.movimentacoes || []);
        setHistorico(movs);
        setPontos(Number.isFinite(data?.pontos) ? data.pontos : calcularSaldo(movs));
      }
    } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao carregar histórico.');
      setMensagemErro(mensagem);
      setErroVisivel(true);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (usuario?.cpf) {
      carregarDados();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuario?.cpf]);

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

  const totalEntradas = historico.filter((h) => h.tipo === 'entrada').length;
  const totalSaidas = historico.filter((h) => h.tipo === 'saida' && h.status === 'valido').length;
  const totalUtilizados = historico.filter((h) => h.tipo === 'saida' && h.status === 'utilizado').length;
  const totalExpirados = historico.filter((h) => h.tipo === 'saida' && h.status === 'expirado').length;

  const filtrar = (item) => {
    const textoBusca = busca.toLowerCase();
    const atendeBusca =
      item.descricao?.toLowerCase().includes(textoBusca) ||
      item.codigoVoucher?.toLowerCase().includes(textoBusca);

    if (!atendeBusca) return false;

    switch (filtro) {
      case 'entrada':
        return item.tipo === 'entrada';
      case 'vouchers adquiridos':
        return item.tipo === 'saida' && item.status === 'valido';
      case 'vouchers utilizados':
        return item.tipo === 'saida' && item.status === 'utilizado';
      case 'vouchers expirados':
        return item.tipo === 'saida' && item.status === 'expirado';
      default:
        return true;
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
        <Text style={styles.data}>📅 {item.data || item.timestamp}</Text>
        <Text style={styles.pontos}>
          {item.tipo === 'entrada' ? '+' : '-'}
          {item.pontos} pontos
        </Text>
        <Text style={styles.descricao}>
          {item.tipo === 'entrada'
            ? item.descricao
            : `Troca por voucher de ${item.tipoVoucher || 'benefício'}`}
        </Text>
        {item.codigoVoucher && <Text style={styles.comparativo}>🔑 Código: {item.codigoVoucher}</Text>}
        {item.produtos && <Text style={styles.info}>📦 Produtos: {item.produtos.join(', ')}</Text>}
        {item.empresa && <Text style={styles.info}>🏢 Empresa: {item.empresa}</Text>}
        {item.endereco && <Text style={styles.info}>📍 Endereço: {item.endereco}</Text>}
        {item.validade && (
          <Text style={styles.info}>
            📅 Validade: {new Date(item.validade).toLocaleDateString('pt-BR')}
          </Text>
        )}
        {item.status && (
          <Text style={[styles.info, { color: corStatus }]}>
            {iconeStatus} Status: {item.status}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentBox}>
      <HeaderComFiltros
  titulo="Histórico Pontos e Vouchers"
  subtitulo={`Total de pontos disponíveis: ${pontos}`}
  saldo={undefined} // escondemos a linha corrida para usar o grid 2x2
  tipos={opcoesFiltro}
  tipoSelecionado={filtro}
  onSelecionarTipo={setFiltro}
  children={
    <View style={styles.kpiGrid}>
      <View style={styles.kpiItem}>
        <Text style={styles.kpiLabel}>
          <Text style={styles.kpiIcon}>➕</Text> Entradas
        </Text>
        <Text style={styles.kpiValue}>{totalEntradas}</Text>
      </View>

      <View style={styles.kpiItem}>
        <Text style={styles.kpiLabel}>
          <Text style={styles.kpiIcon}>🎁</Text> Vouchers
        </Text>
        <Text style={styles.kpiValue}>{totalSaidas}</Text>
      </View>

      <View style={styles.kpiItem}>
        <Text style={styles.kpiLabel}>
          <Text style={styles.kpiIcon}>✅</Text> Utilizados
        </Text>
        <Text style={styles.kpiValue}>{totalUtilizados}</Text>
      </View>

      <View style={styles.kpiItem}>
        <Text style={styles.kpiLabel}>
          <Text style={styles.kpiIcon}>⏰</Text> Expirados
        </Text>
        <Text style={styles.kpiValue}>{totalExpirados}</Text>
      </View>
    </View>
  }
/>
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

        <VerMaisMenos
          mostrarTodos={mostrarTodos}
          temMais={temMais}
          onVerMais={carregarMais}
          onVerMenos={verMenos}
          carregando={carregandoMais}
        />
      </View>

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  contentBox: {
    width: '100%',
    alignSelf: 'center',
  },
  kpiLabel: {
    fontSize: fonts.size.sm,
    color: colors.verde,
    marginBottom: 2,
    textAlign: 'center',
  },
  kpiIcon: {
    color: colors.verde,
  },
  kpiValue: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,     // número verde
    textAlign: 'center',
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
});
