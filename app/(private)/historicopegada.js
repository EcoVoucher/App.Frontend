import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  UIManager,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import PegadaTermometro from '../../components/PegadaTermometro';
import BotaoVerde from '../../components/BotaoVerde';

const { height } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HistoricoPegada() {
  const { width } = useWindowDimensions();
  const { usuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 3;

  useEffect(() => {
    const carregarHistorico = async () => {
      setCarregando(true);
      try {
        const dados = await apiMock.obterHistoricoPegada(usuario?.cpf || usuario?.cnpj);
        const ordenado = dados.sort((a, b) => new Date(b.data) - new Date(a.data));
        setHistorico(ordenado);
      } catch (error) {
        console.error('Erro ao carregar histórico:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, []);

  const obterComparativo = (ponto) => {
    if (ponto <= 160) return 'Sustentável: até 1.6 gha';
    if (ponto <= 270) return 'Abaixo da média mundial (~2.7 gha)';
    if (ponto <= 400) return 'Acima da média sustentável, similar ao Brasil (~3.0 gha)';
    if (ponto <= 600) return 'Alta, similar à França ou Suécia (~4.6 a 6.0 gha)';
    if (ponto <= 800) return 'Muito alta (~6.0 gha)';
    return 'Extremamente alta, como os EUA (~8.0 gha)';
  };

  const obterIcone = (ponto) => {
    if (ponto <= 160) return '✅';
    if (ponto <= 270) return '🟢';
    if (ponto <= 400) return '🟠';
    if (ponto <= 600) return '🟡';
    if (ponto <= 800) return '🔵';
    return '🔴';
  };

  const historicoVisivel = mostrarTodos
    ? historico
    : historico.slice(0, pagina * itensPorPagina);

  const temMais = historicoVisivel.length < historico.length;

  const carregarMais = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPagina((p) => p + 1);
  };

  const verMenos = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setMostrarTodos(false);
    setPagina(1);
  };

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.contentBox, { width: width > 700 ? '60%' : '110%'}]}>
        <View style={styles.headerBox}>
          <Text style={styles.titulo}>Histórico de Pegadas</Text>
          {historico.length > 0 && (
            <PegadaTermometro pontuacao={historico[0].pontuacao} />
          )}
        </View>

        {carregando ? (
          <ActivityIndicator size="large" color={colors.verde} />
        ) : historico.length === 0 ? (
          <Text style={styles.vazio}>Nenhuma pegada registrada ainda.</Text>
        ) : (
          historicoVisivel.map((item, index) => (
            <View
              key={index}
              style={[styles.card, item.data === historico[0].data && styles.cardUltimo]}
            >
              <Text style={styles.data}>
                {new Date(item.data).toLocaleDateString()}
              </Text>
              <Text style={styles.pontos}>
                {obterIcone(item.pontuacao)} {item.pontuacao} pontos
              </Text>
              <Text style={styles.comparativo}>
                {obterComparativo(item.pontuacao)}
              </Text>
            </View>
          ))
        )}

        {!carregando && historico.length > 3 && (
          <View style={styles.botaoContainer}>
            {!mostrarTodos && temMais && (
              <BotaoVerde texto="Ver mais ▼" onPress={carregarMais} />
            )}
            {(mostrarTodos || (!temMais && historico.length > itensPorPagina)) && (
              <BotaoVerde texto="Ver menos ▲" onPress={verMenos} />
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
    scrollContainer: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md, // <- ADICIONAR
    paddingBottom: spacing.xl,
  },
  contentBox: {
    alignSelf: 'center',
  },
  headerBox: {
    backgroundColor: colors.branco,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  vazio: {
    textAlign: 'center',
    color: colors.cinza,
    fontSize: fonts.size.sm,
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: colors.branco,
    padding: spacing.md,
    borderRadius: 10,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  cardUltimo: {
    borderWidth: 2,
    borderColor: colors.verde,
    backgroundColor: '#f0fff0',
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
  comparativo: {
    fontSize: fonts.size.sm,
    color: colors.verde,
  },
  botaoContainer: {
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
