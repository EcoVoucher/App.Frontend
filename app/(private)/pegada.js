import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Alert,
} from 'react-native';
import BotaoVerde from '../../components/BotaoVerde';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { perguntas } from '../../components/forms/FormPegada';
import { obterComparativoPegada } from '../../utils/formatadores';
import { useRouter } from 'expo-router';

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
  }, [usuario, aguardandoRedirecionamento, resultado, router]);

  const handleChange = (campo, valor) => {
    const novasRespostas = { ...respostas, [campo]: valor };

    setRespostas(novasRespostas);

    setErros((err) => {
      const novosErros = { ...err };
      if (valor !== '') delete novosErros[campo];
      return novosErros;
    });

    // Avança imediatamente com as novas respostas
    setTimeout(() => {
      const campoAtual = `q${indiceAtual + 1}`;
      if (novasRespostas[campoAtual] !== '') {
        avancar();
      }
    }, 100);
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
  } else {
    // 👉 Se for a última pergunta, calcular automaticamente
    calcularPegada();
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
        <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((indiceAtual + 1) / perguntas.length) * 100}%` },
          ]}
        />
      </View>
        <Text style={styles.progresso}>Pergunta {progresso}</Text>
        <Text style={styles.pergunta}>{perguntaAtual.label}</Text>

        <Animated.View style={{ opacity: fadeAnim, width: '100%', marginBottom: spacing.md }}>
          <View style={styles.opcoesContainer}>
            {perguntaAtual.opcoes.map((opcao, index) => {
              const chave = `q${indiceAtual + 1}`;
              const selecionada = respostas[chave] === opcao.value;

              return (
                <Text
                  key={index}
                  style={[styles.opcaoBotao, selecionada && styles.opcaoSelecionada]}
                  onPress={() => handleChange(chave, opcao.value)}
                >
                  {opcao.label}
                </Text>
              );
            })}
            {erros[`q${indiceAtual + 1}`] && (
              <Text style={styles.textoErro}>{erros[`q${indiceAtual + 1}`]}</Text>
            )}
          </View>
        </Animated.View>

        <View style={styles.botoesBox}>
          {indiceAtual > 0 && (
            <BotaoVerde texto="Voltar" onPress={voltar} style={styles.botaoUnico} />
          )}
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
  opcoesContainer: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  opcaoBotao: {
    padding: spacing.md,
    backgroundColor: '#f1f1f1',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: fonts.size.md,
    color: colors.preto,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  opcaoSelecionada: {
    backgroundColor: colors.verdeClaro || '#cde8c1',
    borderColor: colors.verde,
    color: colors.verdeEscuro || '#135e2f',
    fontWeight: fonts.weight.bold,
  },
  textoErro: {
    color: 'red',
    fontSize: fonts.size.sm,
    marginTop: spacing.xs,
  },
  progressBar: {
  width: '100%',
  height: 8,
  backgroundColor: '#e0e0e0',
  borderRadius: 4,
  marginBottom: spacing.sm,
},
progressFill: {
  height: '100%',
  backgroundColor: colors.verde,
  borderRadius: 4,
},

});
