import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Alert,
  Pressable,
} from 'react-native';
import ModalSucesso from '../../components/ModalSucesso';
import BotaoVerde from '../../components/BotaoVerde';
import { useAuth } from '../../context/AuthContext';
import apiMock from '../../services/apiMock';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { perguntas } from '../../components/forms/FormPegada';
import { obterComparativoPegada, apenasNumeros } from '../../utils/formatadores';
import { useRouter } from 'expo-router';

export default function Pegada() {
  const router = useRouter();
  const { usuario, login } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [ultimaPontuacao, setUltimaPontuacao] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    if (resultado) {
      setMostrarModal(true);
      setTimeout(() => {
        setMostrarModal(false);

        if (usuario?.primeiroAcesso) {
          login({
            token: 'mock-token-pegada',
            usuario: { ...usuario, primeiroAcesso: false },
          });
        }
        router.replace('/(private)/home');
      }, 4000);
    }
  }, [resultado]);

  const perguntaAtual = perguntas[indiceAtual];
  const chaveAtual = `q${indiceAtual + 1}`;

 const handleChange = (campo, valor) => {
  setRespostas((prev) => ({ ...prev, [campo]: valor }));
  setErros((prev) => {
    const novosErros = { ...prev };
    delete novosErros[campo];
    return novosErros;
  });

  // 🔥 Espera 200ms para mostrar a seleção antes de avançar
  if (indiceAtual < perguntas.length - 1) {
    setTimeout(() => {
      avancar();
    }, 200);
  }
};


  const avancar = () => {
    if (indiceAtual < perguntas.length - 1) {
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
  setCarregando(true); 

  try {
    const todasRespondidas = perguntas.every((_, i) => {
      const chave = `q${i + 1}`;
      return respostas[chave] !== undefined && respostas[chave] !== '';
    });

    if (!todasRespondidas) {
      Alert.alert('Atenção', 'Por favor, responda todas as perguntas.');
      setCarregando(false);
      return;
    }

    const soma = Object.values(respostas).reduce(
      (acc, val) => acc + (parseInt(val) || 0),
      0
    );

    if (soma === ultimaPontuacao) {
      Alert.alert('Pegada já salva', 'Você já salvou essa pegada.');
      setCarregando(false);
      return;
    }

    const comparativo = obterComparativoPegada(soma);
    const documento = apenasNumeros(usuario?.cpf || usuario?.cnpj);

    await apiMock.salvarPegada(documento, soma);

    setResultado({ pontos: soma, comparativo });
    setUltimaPontuacao(soma);

  } catch (error) {
    console.error(error);
    Alert.alert('Erro', 'Erro ao salvar pegada.');
  } finally {
    setCarregando(false);
  } 
};

  const progresso = `${indiceAtual + 1} de ${perguntas.length}`;



  return (
    <ScrollView
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

        {perguntaAtual && (
          <>
            <Text style={styles.pergunta}>{perguntaAtual.label}</Text>

            <Animated.View style={{ opacity: fadeAnim, width: '100%', marginBottom: spacing.md }}>
              <View style={styles.opcoesContainer}>
                {(perguntaAtual.opcoes || []).map((opcao, index) => {
                  const selecionada = respostas[chaveAtual] === opcao.value;

                  return (
                    <Pressable
                      key={index}
                      onPress={() => handleChange(chaveAtual, opcao.value)}
                      style={[
                        styles.opcaoBotao,
                        selecionada && styles.opcaoSelecionada,
                      ]}
                    >
                      <Text style={{ textAlign: 'center' }}>{opcao.label}</Text>
                    </Pressable>
                  );
                })}

                {erros[chaveAtual] && (
                  <Text style={styles.textoErro}>{erros[chaveAtual]}</Text>
                )}
              </View>
            </Animated.View>
          </>
        )}

        <View style={styles.botoesBox}>
          {indiceAtual > 0 && (
            <BotaoVerde texto="Voltar" onPress={voltar} />
          )}

          {indiceAtual === perguntas.length - 1 && (
            <BotaoVerde
              texto={carregando ? 'Calculando...' : 'Calcular Pegada'}
              onPress={calcularPegada}
              disabled={carregando}
            />
          )}
        </View>
      </View>
      <ModalSucesso
        visivel={mostrarModal}
        exibirBotao={false}
        onFechar={() => setMostrarModal(false)}
        titulo="Resultado da Pegada"
        mensagem={
          <>
            <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>
              Total de pontos: {resultado?.pontos}
            </Text>
            <Text style={{ marginBottom: 8 }}>
              {resultado?.comparativo}
            </Text>
            
            <Text style={{ fontSize: fonts.size.sm, color: colors.cinza }}>
              Redirecionando para a Home...
            </Text>
          </>
        }
/>

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
  opcoesContainer: {
    width: '100%',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  opcaoBotao: {
    padding: spacing.md,
    backgroundColor: colors.branco,
    borderRadius: 8,
    textAlign: 'center',
    fontSize: fonts.size.md,
    color: colors.preto,
    borderWidth: 1,
    borderColor: colors.cinza,
  },
  opcaoSelecionada: {
    backgroundColor: colors.verdeClaro,
    borderColor: colors.verde,
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
    backgroundColor: colors.branco,
    borderRadius: 4,
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.verde,
    borderRadius: 4,
  },
});
