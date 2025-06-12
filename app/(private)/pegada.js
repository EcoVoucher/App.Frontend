import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import BotaoVerde from '../../components/BotaoVerde';
import SelectField from '../../components/SelectField';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { perguntas } from '../../components/forms/FormPegada';
import { obterComparativoPegada, obterIconePegada, formatarDataBR } from '../../utils/formatadores';


const { width } = Dimensions.get('window');

export default function Pegada() {
  const router = useRouter();
  const { usuario, login } = useAuth();
  const scrollRef = useRef(null);
  const resultadoRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [ultimaPontuacao, setUltimaPontuacao] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [aguardandoRedirecionamento, setAguardandoRedirecionamento] = useState(false);


  const perguntaAtual = perguntas[indiceAtual];

 useEffect(() => {
  if (aguardandoRedirecionamento && resultado) {
    setTimeout(() => {
      router.replace('/(private)/home');
    }, 4000);
  }
}, [usuario, aguardandoRedirecionamento, resultado]);



  const handleChange = (campo, valor) => {
    setRespostas((prev) => {
      const novos = { ...prev, [campo]: valor };
      setErros((err) => {
        const novosErros = { ...err };
        if (valor !== '') delete novosErros[campo];
        return novosErros;
      });
      return novos;
    });
  };

  const avancar = () => {
    const campoAtual = `q${indiceAtual + 1}`;
    const respostaAtual = respostas[campoAtual];

    if (respostaAtual === '' || respostaAtual === undefined) {
      setErros((prev) => ({ ...prev, [campoAtual]: 'Campo obrigatório' }));
      return;
    }

    if (indiceAtual < perguntas.length - 1) {
      const proximaPergunta = `q${indiceAtual + 2}`;
      setRespostas((prev) => ({ ...prev, [proximaPergunta]: '' }));

      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      setIndiceAtual((prev) => prev + 1);
    }
  };

  const voltar = () => {
    if (indiceAtual > 0) {
      setIndiceAtual((prev) => prev - 1);
    }
  };

  const calcularPegada = async () => {
    if (carregando) return;
    const todasRespondidas = perguntas.every((_, i) => {
      const chave = `q${i + 1}`;
      return respostas[chave] !== undefined && respostas[chave] !== '';
    });

    if (!todasRespondidas) {
      Alert.alert('Atenção', 'Por favor, responda todas as perguntas.');

      perguntas.forEach((_, i) => {
        const chave = `q${i + 1}`;
        if (!respostas[chave]) {
          setErros((prev) => ({ ...prev, [chave]: 'Campo obrigatório' }));
        }
      });

      return;
    }

    const soma = Object.values(respostas).reduce(
      (acc, val) => acc + (parseInt(val) || 0),
      0
    );

    if (soma === ultimaPontuacao) {
      Alert.alert('Pegada já salva', 'Você já salvou essa pegada.');
      return;
    }

    const comparativo = obterComparativoPegada(soma);
    

    setCarregando(true);
    try {
       // 🔄 Substituir por chamada real: await api.post('/pegada', { cpfOuCnpj: usuario?.cpf || usuario?.cnpj, pontuacao: soma })
      await apiMock.salvarPegada(usuario?.cpf || usuario?.cnpj, soma);
      setResultado({ pontos: soma, comparativo });
      setUltimaPontuacao(soma);

      if (usuario?.primeiroAcesso) {
        // 🔄 Substituir por refresh da sessão via API real (ex: revalidar token e atualizar dados)
          login({
            token: 'mock-token-pegada',
            usuario: { ...usuario, primeiroAcesso: false },
          });
          setAguardandoRedirecionamento(true); // <- ativa flag temporária
        }

      setTimeout(() => {
        resultadoRef.current?.measureLayout(
          scrollRef.current,
          (x, y) => scrollRef.current.scrollTo({ y, animated: true }),
          () => {}
        );
      }, 300);
    } catch (error) {
      console.error(error);
      alert('Erro ao salvar pegada.');
    } finally {
      setCarregando(false);
    }
  };

  const progresso = `${indiceAtual + 1} de ${perguntas.length}`;

  return (
    <ScrollView
      ref={scrollRef}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.contentBox}>
        <Image
          source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.titulo}>Pegada Ecológica</Text>
        <Text style={styles.subtitulo}>
          Responda o questionário abaixo para descobrir sua pegada ecológica no planeta.
        </Text>

        <Text style={styles.progresso}>Pergunta {progresso}</Text>
        <Text style={styles.pergunta}>{perguntaAtual.label}</Text>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', marginBottom: spacing.md }}>
          <SelectField
            selectedValue={respostas[`q${indiceAtual + 1}`]}
            onValueChange={(v) => handleChange(`q${indiceAtual + 1}`, v)}
            options={perguntaAtual.opcoes}
            error={erros[`q${indiceAtual + 1}`]}
          />
        </Animated.View>

        <View style={styles.botoesBox}>
          {indiceAtual > 0 && (
            <BotaoVerde texto="Voltar" onPress={voltar} style={styles.botaoUnico} />
          )}
          <BotaoVerde
            texto={indiceAtual < perguntas.length - 1 ? 'Próxima' : 'Calcular Pegada'}
            onPress={indiceAtual < perguntas.length - 1 ? avancar : calcularPegada}
            carregando={indiceAtual === perguntas.length - 1 && carregando}
            style={styles.botaoUnico}
          />
        </View>

        {resultado && (
          <View ref={resultadoRef} style={styles.resultadoBox}>
            <Text style={styles.resultadoTitulo}>Resultado</Text>
            <Text style={styles.resultadoTexto}>Total de pontos: {resultado.pontos}</Text>
            <Text style={styles.resultadoTexto}>{resultado.comparativo}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
    alignItems: 'center',
  },
  contentBox: {
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  logo: {
    width: 130,
    height: 130,
    alignSelf: 'center',
    marginBottom: spacing.md,
    borderRadius: 5,
  },
  titulo: {
    fontSize: fonts.size.xxl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  progresso: {
    fontSize: fonts.size.sm,
    color: colors.preto,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  pergunta: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.medium,
    textAlign: 'center',
    marginBottom: spacing.sm,
    color: colors.preto,
  },
  botoesBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  botaoUnico: {
    minWidth: 0.5,
  },
  resultadoBox: {
    backgroundColor: colors.branco,
    padding: spacing.md,
    borderRadius: 10,
    marginTop: spacing.lg,
    elevation: 3,
    width: '100%',
  },
  resultadoTitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.preto,
    marginBottom: spacing.xs,
  },
  resultadoTexto: {
    fontSize: fonts.size.sm,
    color: colors.preto,
  },
});
