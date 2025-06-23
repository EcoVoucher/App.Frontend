import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { PegadaService } from '../../services/pegadaService';
import { useRouter } from 'expo-router';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import PegadaTermometro from '../../components/PegadaTermometro';
import { formatarDataBR, obterComparativoPegada } from '../../utils/formatadores';
import VerMaisMenos from '../../components/VerMaisMenos';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { apenasNumeros } from '../../utils/formatadores';


const { height } = Dimensions.get('window');

export default function HistoricoPegada() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { usuario } = useAuth();
  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const itensPorPagina = 2;

  useEffect(() => {
    const carregarHistorico = async () => {
      setCarregando(true);
      try {
        const documento = apenasNumeros(usuario?.cpf);
        const dados = await PegadaService.obterHistorico(documento);
        
        setHistorico(dados);
      }catch (error) {
  console.error(error);
  Alert.alert('Erro', obterMensagemErro(error, 'Erro ao carregar histórico.'));
}
 finally {
        setCarregando(false);
      }
    };

    carregarHistorico();
  }, []);

  const historicoVisivel = mostrarTodos
    ? historico
    : historico.slice(0, itensPorPagina);

  const temMais = historico.length > historicoVisivel.length;

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
      showsVerticalScrollIndicator={false}
    >
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
            <View
              key={index}
              style={[
                styles.card,
                item.data === historico[0].data && styles.cardUltimo,
              ]}
            >
              <Text style={styles.data}>📅 {formatarDataBR(item.data)}</Text>
              <Text style={styles.pontos}> {item.pontuacao} pontos</Text>
              <Text style={styles.comparativo}>
                {obterComparativoPegada(item.pontuacao)}
              </Text>
            </View>
          ))
        )}

        {!carregando && historico.length > itensPorPagina && (
          <VerMaisMenos
            temMais={temMais}
            mostrarTodos={mostrarTodos}
            onVerMais={() => setMostrarTodos(true)}
            onVerMenos={() => setMostrarTodos(false)}
          />
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
});
