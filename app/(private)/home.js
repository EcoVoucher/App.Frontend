import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import AnimatedCard from '../../components/AnimatedCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/apiMock';
import { obterComparativoPegada } from '../../utils/formatadores';

export default function Home() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 500;

  const [usuario, setUsuario] = useState(null);
  const [pegada, setPegada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [qtdVouchers, setQtdVouchers] = useState(0);
  const [vouchersUtilizados, setVouchersUtilizados] = useState(0);
  const [icones, setIcones] = useState([]);
  const [carregando, setCarregando] = useState(true);

  const mensagens = [
    { texto: '🌱 Acompanhe sua pegada ecológica.' },
    { texto: '📍 Encontre pontos de coleta próximos de você.' },
    { texto: '🌍 Contribua com os ODS da ONU.' },
  ];

 useEffect(() => {
  let intervalo;

  const carregarDados = async () => {
    try {
      const json = await AsyncStorage.getItem('usuario');
      if (!json) return;

      const u = JSON.parse(json);
      const usuarios = await api.obterUsuarios();
      const usuarioAtualizado = usuarios.find(us => (us.cpf || us.cnpj) === (u.cpf || u.cnpj));
      if (!usuarioAtualizado) return;

      setUsuario(usuarioAtualizado);
      setPontos(usuarioAtualizado.pontos || 0);

      if (u.tipo === 'pf') {
        // Apenas PF pode acessar histórico de pegada
        if (u.cpf) {
          const historico = await api.obterHistoricoPegada(u.cpf);
          if (historico.length > 0) {
            const ultima = historico[historico.length - 1];
            setPegada(ultima.pontuacao);
          }
        }

        setIcones([
          { imagem: require('../../assets/imagensEco/historicoIcon.png'), rota: '/(private)/historicopontos', label: 'Histórico \nde Pontos' },
          { imagem: require('../../assets/imagensEco/catalogoIcon.png'), rota: '/(private)/catalogovoucherspf', label: 'Vouchers \npara Troca' },
          { imagem: require('../../assets/imagensEco/pontoColetaIcon.png'), rota: '/(private)/pontoscoleta', label: 'Pontos \nde Coleta' },
        ]);
      }

      if (u.tipo === 'pj') {
        const vouchers = await api.obterVouchersPorCNPJ(u.cnpj);
        const totalGerados = vouchers.reduce((acc, v) => acc + (v.quantidade || 0), 0);
        setQtdVouchers(totalGerados);

        const utilizados = await api.contarVouchersCompradosPorCNPJ(u.cnpj);
        setVouchersUtilizados(utilizados);

        setIcones([
          { imagem: require('../../assets/imagensEco/gerarVoucherIcon.png'), rota: '/(private)/catalogorecompensapj', label: 'Gerar Voucher' },
          { imagem: require('../../assets/imagensEco/validarVoucherIcon.png'), rota: '/(private)/validarvoucherpj', label: 'Validar Voucher' },
          { imagem: require('../../assets/imagensEco/faleConoscoIcon.png'), rota: '(private)/faleconosco', label: 'Contato' },
        ]);
      }

    } catch (erro) {
      console.error('Erro ao carregar dados da Home:', erro);
    } finally {
      setCarregando(false);
    }
  };

  carregarDados();
  intervalo = setInterval(carregarDados, 10000);
  return () => clearInterval(intervalo);
}, []);

obterComparativoPegada(pegada)

  return (
    <View style={styles.container}>
          <View style={styles.blocoInformativo}>
          <View style={styles.cabecalho}>
            <Image source={require ('../../assets/imagensEco/ecoVoucherIcon.png')} style={styles.logo} />
            <View style={styles.boasVindas}>
              <Text style={[styles.titulo, { fontSize: isLargeScreen ? fonts.size.xl : fonts.size.lg }]}>Olá, {usuario?.nome || usuario?.nomeEmpresa || ''}!</Text>
              <Text style={[styles.subtitulo, { fontSize: isLargeScreen ? fonts.size.md : fonts.size.sm }]}>Transforme suas ações em benefícios.</Text>
            </View>
          </View>

          {usuario?.tipo === 'pf' ? (
            <>
              <Text style={styles.destaqueItem}>💚 Pontos Disponíveis: <Text style={styles.valor}>{pontos}</Text></Text>
              <Text style={styles.destaqueItem}>🌿 Pegada Ecológica: <Text style={[styles.valor, { color: colors.verde }]}>{pegada ?? '---'} pts</Text></Text>
              {pegada && (
                <Text style={styles.destaqueItemDesc}><Text style={{ fontStyle: 'italic' }}>{obterComparativoPegada(pegada)}</Text></Text>
              )}
              <TouchableOpacity onPress={() => router.push('/(private)/pegada')} style={[styles.botaoPrincipal, { width: isLargeScreen ? 220 : 180 }]}>
                <Text style={[styles.botaoPrincipalTexto, { fontSize: isLargeScreen ? fonts.size.md : fonts.size.sm }]}>Atualizar Pegada</Text>
              </TouchableOpacity>
            </>
          ) : (
           <>
            <Text style={styles.destaqueItem}>📦 Vouchers gerados: <Text style={styles.valor}>{qtdVouchers}</Text></Text>
            <Text style={styles.destaqueItem}>✅ Adquiridos por PF: <Text style={styles.valor}>{vouchersUtilizados}</Text></Text>
          </>
          )}
        </View>

        <View style={styles.conteudoCentral}>
          <View style={styles.grid}>
            {icones.map((item, index) => (
              <AnimatedCard key={index} imagem={item.imagem} rota={item.rota} label={item.label} />
            ))}
          </View>

          <View style={styles.carouselContainer}>
            <Carousel
              loop
              width={width * 0.9}
              height={isLargeScreen ? 60:50}
              autoPlay
              scrollAnimationDuration={4000}
              data={mensagens}
              renderItem={({ item }) => (
                <View style={[
                  styles.carouselItem,
                  {
                    paddingHorizontal: isLargeScreen ? spacing.lg : spacing.md,
                    minHeight: isLargeScreen ? 60: 50,
                  },
                ]}>
                  <Text style={styles.carouselText}>{item.texto}</Text>
                </View>
              )}
            />
          </View>
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.fundo,
  },
  conteudoCentral: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
},
 scroll: {
  flexGrow: 1,
  paddingHorizontal: spacing.md,
  paddingTop: spacing.md,
  paddingBottom: spacing.xl,
},

  blocoInformativo: {
    width: '100%',
    backgroundColor: colors.branco,
     borderColor: colors.borda,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  cabecalho: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 60,
    height: 60,
    resizeMode: 'contain',
    marginRight: spacing.sm,
  },
  boasVindas: {
    flex: 1,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
  subtitulo: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
  },
  destaqueItem: {
    fontSize: fonts.size.md,
    color: colors.verde,
    marginBottom: 4,
  },
  destaqueItemDesc: {
    fontSize: fonts.size.sm,
    color: colors.cinza,
    marginBottom: 8,
  },
  valor: {
    fontWeight: 'bold',
  },
  botaoPrincipal: {
    backgroundColor: colors.verdeClaro,
    paddingVertical: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.md,
    alignItems: 'center',
    width: 200,
  },
  botaoPrincipalTexto: {
    color: colors.verde,
    fontWeight: 'bold',
    fontSize: fonts.size.md,
  },
  grid: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: spacing.md,
  marginBottom: spacing.md,
},

 carouselContainer: {
  marginTop: spacing.l,      
  marginBottom: spacing.sm
},
  carouselItem: {
    backgroundColor: colors.verdeClaro,
    padding:spacing.sm,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselText: {
    fontSize: fonts.size.sm,
    color: colors.verde,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
