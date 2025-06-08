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
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import PegadaTermometro from '../../components/PegadaTermometro';
import BotaoVerde from '../../components/BotaoVerde';
import { formatarDataBR, obterComparativoPegada} from '../../utils/formatadores';



const { height } = Dimensions.get('window');


if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function HistoricoPegada() {
  const router = useRouter(); 
  const { width } = useWindowDimensions();
  const { usuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [pagina, setPagina] = useState(1);
  const itensPorPagina = 3;
  const [carregandoMais, setCarregandoMais] = useState(false);



  useEffect(() => {
    const carregarHistorico = async () => {
      setCarregando(true);
      try {
        const dados = await apiMock.obterHistoricoPegada(usuario?.cpf);
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

  const historicoVisivel = mostrarTodos
    ? historico
    : historico.slice(0, pagina * itensPorPagina);

  const temMais = historicoVisivel.length < historico.length;

const carregarMais = () => {
  if (carregandoMais) return; 

  setCarregandoMais(true);
  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  setPagina((p) => p + 1);

  // Simula um tempo de carregamento para resetar o estado
  setTimeout(() => setCarregandoMais(false), 500);
};

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { minHeight: height }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.contentBox, { width: width > 700 ? '60%' : '110%' }]}>
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
            <View key={index} style={[styles.card, item.data === historico[0].data && styles.cardUltimo]}>
              <Text style={styles.data}>📅 {formatarDataBR(item.data)}</Text>
              <Text style={styles.pontos}> {item.pontuacao} pontos</Text>
              <Text style={styles.comparativo}>{obterComparativoPegada(item.pontuacao)}</Text>
            </View>
          ))
        )}

        {!carregando && historico.length > 3 && (
          <View style={styles.botaoContainer}>
            {!mostrarTodos && temMais && (
             <BotaoVerde
                texto="Ver mais ▼"
                onPress={carregarMais}
                carregando={carregandoMais} // se quiser mostrar o loader
              />
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
    paddingHorizontal: spacing.lg,
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
    borderWidth: 1.5,
    borderColor: colors.verde,
  },
  cardUltimo: {
    backgroundColor: '#f0fff0',
  },
  data: {
    fontSize: fonts.size.xs,
    color: colors.cinza,
    marginBottom: 4,
  },
  pontos: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
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
