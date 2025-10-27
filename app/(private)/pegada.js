import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Animated,
  Pressable,
} from 'react-native';
import ModalSucesso from '../../components/ModalSucesso';
import BotaoVerde from '../../components/BotaoVerde';
import { useAuth } from '../../context/AuthContext';
import { PegadaService } from '../../services/pegadaService';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { spacing } from '../../theme/spacing';
import { perguntas } from '../../components/forms/FormPegada';
import { obterComparativoPegada, apenasNumeros } from '../../utils/formatadores';
import { useRouter } from 'expo-router';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

export default function Pegada() {
  const router = useRouter();
  const { usuario } = useAuth();
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const [respostas, setRespostas] = useState({});
  const [erros, setErros] = useState({});
  const [carregando, setCarregando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [ultimaPontuacao, setUltimaPontuacao] = useState(null);
  const [indiceAtual, setIndiceAtual] = useState(0);

  const [mostrarModal, setMostrarModal] = useState(false);

  // aviso de pegada repetida
  const [pegadaRepetida, setPegadaRepetida] = useState(false);

  // novo: estamos aguardando redirect pra home?
  const [redirecionando, setRedirecionando] = useState(false);

  // reset inicial
  useEffect(() => {
    setResultado(null);
    setMostrarModal(false);
    setCarregando(false);
    setPegadaRepetida(false);
    setRedirecionando(false);
  }, []);

  // redirect após salvar com sucesso
  useEffect(() => {
    if (resultado) {
      setMostrarModal(true);
      setRedirecionando(true); // bloqueia botões enquanto espera ir pra home

      const t = setTimeout(() => {
        setMostrarModal(false);
        router.replace('/(private)/home');
      }, 4000);

      return () => clearTimeout(t);
    }
  }, [resultado, router]);

  // redirect após pegada repetida (pontuação igual)
  useEffect(() => {
    if (pegadaRepetida) {
      setRedirecionando(true); // bloqueia botões e escurece fundo

      const t = setTimeout(() => {
        router.replace('/(private)/home');
      }, 4000);

      return () => clearTimeout(t);
    }
  }, [pegadaRepetida, router]);

  // carrega última pontuação uma vez
  useEffect(() => {
    let ativo = true;

    const carregarUltimaPegada = async () => {
      try {
        const documento = apenasNumeros(usuario?.cpf || usuario?.cnpj);
        if (!documento) return;

        const res = await PegadaService.obterUltimaPontuacao(documento);
        if (!ativo) return;

        if (res.ok) {
          const d = res.data;
          const valorBruto = typeof d === 'number' ? d : d?.pontuacao;
          const num = Number(valorBruto);
          setUltimaPontuacao(Number.isFinite(num) ? num : null);
        } else {
          console.warn('[Pegada] obterUltimaPontuacao erro:', res.error);
        }
      } catch (error) {
        console.warn(
          '[Pegada] erro ao carregar última pegada:',
          obterMensagemErro(error, 'Erro ao carregar sua última pegada.')
        );
      }
    };

    carregarUltimaPegada();
    return () => {
      ativo = false;
    };
  }, [usuario]);

  const perguntaAtual = perguntas[indiceAtual];
  const chaveAtual = `q${indiceAtual + 1}`;

  const handleChange = (campo, valor) => {
    // se já estamos redirecionando, ignora cliques
    if (redirecionando) return;

    setRespostas((prev) => ({ ...prev, [campo]: valor }));
    setErros((prev) => {
      const novosErros = { ...prev };
      delete novosErros[campo];
      return novosErros;
    });

    // Só avança automaticamente SE NÃO for a última pergunta
    if (indiceAtual < perguntas.length - 1) {
      setTimeout(() => {
        avancar();
      }, 200);
    }
  };

  const avancar = () => {
    if (redirecionando) return;
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
    if (redirecionando) return;
    if (indiceAtual > 0) {
      setIndiceAtual((prev) => prev - 1);
    }
  };

  // calcularPegada com soma parcial, e agora setando redirecionando corretamente
  const calcularPegada = async () => {
    if (carregando || redirecionando) return;
    setCarregando(true);

    try {
      setPegadaRepetida(false); // limpa msg antiga
      setErros({});            // limpa mensagem "responda esta pergunta"

      // snapshot atual das respostas
      let respostasCompletas = { ...respostas };

      // garante que a pergunta atual tá no snapshot
      if (
        respostas[chaveAtual] !== undefined &&
        respostas[chaveAtual] !== '' &&
        respostasCompletas[chaveAtual] === undefined
      ) {
        respostasCompletas[chaveAtual] = respostas[chaveAtual];
      }

      // pega só as respostas realmente preenchidas
      const valoresRespondidos = Object.values(respostasCompletas)
        .filter((v) => v !== undefined && v !== '');

      // se não respondeu NADA, aí sim reclama
      if (valoresRespondidos.length === 0) {
        setErros((prev) => ({
          ...prev,
          [chaveAtual]: 'Por favor, responda esta pergunta.',
        }));
        setCarregando(false);
        return;
      }

      // soma parcial
      const somaAtual = valoresRespondidos.reduce(
        (acc, val) => acc + (parseInt(val) || 0),
        0
      );

      const ultimaNum = Number(ultimaPontuacao);
      const temUltimaValida = Number.isFinite(ultimaNum);

      console.log(
        '[Pegada] somaAtual:', somaAtual,
        'ultimaPontuacao state:', ultimaPontuacao,
        'ultimaNum:', ultimaNum
      );

      // mesma pontuação -> não salva, mostra aviso amigável + overlay + bloqueia botões
      if (temUltimaValida && somaAtual === ultimaNum) {
        setPegadaRepetida(true);
        // redirecionando passa a true no useEffect(pegadaRepetida)
        setCarregando(false);
        return;
      }

      // diferente -> salva no backend
      const documento = apenasNumeros(usuario?.cpf || usuario?.cnpj);
      const comparativo = obterComparativoPegada(somaAtual);

      const resp = await PegadaService.salvarPontuacao({
        documento,
        pontuacao: somaAtual,
      });

      if (!resp.ok) {
        const codeBackend = resp?.error?.code;

        if (codeBackend === 'PEGADA_DUPLICADA') {
          setPegadaRepetida(true);
          setCarregando(false);
          return;
        }

        console.warn(
          '[Pegada] erro salvarPontuacao:',
          obterMensagemErro(
            resp.error,
            'Não foi possível salvar sua pegada agora.'
          )
        );
        setCarregando(false);
        return;
      }

      // sucesso → modal verde padrão + redirect
      setUltimaPontuacao(somaAtual);
      setResultado({ pontos: somaAtual, comparativo });
      // redirecionando passa a true no useEffect(resultado)
    } catch (error) {
      console.warn(
        '[Pegada] erro inesperado:',
        obterMensagemErro(
          error,
          'Erro ao salvar sua pegada. Tente novamente.'
        )
      );
    } finally {
      setCarregando(false);
    }
  };

  const progresso = `${indiceAtual + 1} de ${perguntas.length}`;

  return (
    <>
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
              <Text style={styles.pergunta}>
                {perguntaAtual.label}
              </Text>

              <Animated.View
                style={{ opacity: fadeAnim, width: '100%', marginBottom: spacing.md }}
              >
                <View style={styles.opcoesContainer}>
                  {(perguntaAtual.opcoes || []).map((opcao, index) => {
                    const selecionada = respostas[chaveAtual] === opcao.value;

                    return (
                      <Pressable
                        key={index}
                        onPress={() => handleChange(chaveAtual, opcao.value)}
                        disabled={redirecionando} // bloqueia clique enquanto indo pra home
                        style={[
                          styles.opcaoBotao,
                          selecionada && styles.opcaoSelecionada,
                          redirecionando && styles.botaoDesativadoSuave,
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
              <BotaoVerde
                texto="Voltar"
                onPress={voltar}
                disabled={carregando || redirecionando}
              />
            )}

            {indiceAtual === perguntas.length - 1 && (
              <BotaoVerde
                texto={
                  redirecionando
                    ? 'Redirecionando...'
                    : carregando
                    ? 'Calculando...'
                    : 'Calcular Pegada'
                }
                onPress={calcularPegada}
                disabled={carregando || redirecionando}
              />
            )}
          </View>
        </View>
      </ScrollView>

      {/* overlay e aviso de pegada repetida */}
      {pegadaRepetida && (
        <>
          <View style={styles.overlayBloqueio} pointerEvents="auto" />

          <View style={styles.modalAvisoWrapper} pointerEvents="auto">
            <View style={styles.boxAviso}>
              <Text style={styles.avisoTitulo}>Pegada repetida</Text>
              <Text style={styles.avisoTexto}>
                Sua nova pegada é igual à sua última pegada. Nenhuma alteração foi registrada.
                Você será redirecionado para a Home...
              </Text>
            </View>
          </View>
        </>
      )}

      {/* modal verde de sucesso padrão */}
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
    </>
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
  botaoDesativadoSuave: {
    opacity: 0.5,
  },
  textoErro: {
    color: 'red',
    fontSize: fonts.size.sm,
    marginTop: spacing.xs,
    textAlign: 'center',
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

  /* === BLOQUEIO E AVISO DE PEGADA REPETIDA === */
  overlayBloqueio: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: 999,
  },
  modalAvisoWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  boxAviso: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff8e1',
    borderColor: '#ffcc00',
    borderWidth: 1,
    borderRadius: 12,
    padding: spacing.lg,
  },
  avisoTitulo: {
    color: '#7a5b00',
    fontWeight: 'bold',
    fontSize: fonts.size.md,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  avisoTexto: {
    color: '#7a5b00',
    fontSize: fonts.size.sm,
    textAlign: 'center',
    lineHeight: 18,
  },
});
