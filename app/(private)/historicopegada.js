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
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import HeaderComFiltros from '../../components/HeaderComFiltros';
import PegadaTermometro from '../../components/PegadaTermometro';
import { formatarDataBR, obterComparativoPegada, apenasNumeros } from '../../utils/formatadores';
import VerMaisMenos from '../../components/VerMaisMenos';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import ModalErro from '../../components/ModalErro';

const { height } = Dimensions.get('window');

export default function HistoricoPegada() {
  const { width } = useWindowDimensions();
  const { usuario } = useAuth();

  const [historico, setHistorico] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const itensPorPagina = 2;

  const [mensagemErro, setMensagemErro] = useState('');
  const [erroVisivel, setErroVisivel] = useState(false);

  useEffect(() => {
    let ativo = true;

    const carregarHistorico = async () => {
      setCarregando(true);
      try {
        const documento = apenasNumeros(usuario?.cpf || usuario?.cnpj);
        if (!documento) {
          if (ativo) setHistorico([]);
          return;
        }

        const res = await PegadaService.obterHistorico(documento); // { ok, data | error }
        if (!ativo) return;

        if (res.ok) {
          const lista = Array.isArray(res.data) ? res.data : [];
          // ordena por data desc, se houver campo data
          const ordenado = [...lista].sort((a, b) => {
            const da = new Date(a?.data || 0).getTime();
            const db = new Date(b?.data || 0).getTime();
            return db - da;
          });
          setHistorico(ordenado);
        } else {
          setMensagemErro(obterMensagemErro(res.error, 'Erro ao carregar histórico.'));
          setErroVisivel(true);
          setHistorico([]);
        }
      } catch (error) {
        setMensagemErro(obterMensagemErro(error, 'Erro ao carregar histórico.'));
        setErroVisivel(true);
        setHistorico([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarHistorico();
    return () => {
      ativo = false;
    };
  }, [usuario]);

  const historicoVisivel = mostrarTodos ? historico : historico.slice(0, itensPorPagina);
  const temMais = historico.length > historicoVisivel.length;

  return (
    <ScrollView
      contentContainerStyle={[styles.scrollContainer, { minHeight: height }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentBox, { width: width > 800 ? '80%' : '100%' }]}>
        <HeaderComFiltros titulo="Histórico de Pegadas">
          {historico.length > 0 && (
            <PegadaTermometro pontuacao={historico[0].pontuacao} />
          )}
        </HeaderComFiltros>

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
              <Text style={styles.pontos}>{item.pontuacao} pontos</Text>
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

      <ModalErro
        visivel={erroVisivel}
        mensagem={mensagemErro}
        onClose={() => setErroVisivel(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingBottom: spacing.xl,
  },
  contentBox: {
    alignSelf: 'center',
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
