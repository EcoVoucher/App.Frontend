import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Image,
  Linking,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import Carousel from 'react-native-reanimated-carousel';
import { useAuth } from '../../context/AuthContext'; 
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import AnimatedCard from '../../components/AnimatedCard';
import { obterMensagemErro } from '../../utils/obterMensagemErro';
import { apenasNumeros } from '../../utils/formatarenvio';


import { UsuarioService } from '../../services/usuarioService'; 
import { VouchersService } from '../../services/voucherService'; 



import { obterComparativoPegada } from '../../utils/formatadores';

export default function Home() {
  const router = useRouter();     
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 500;
  const { usuario } = useAuth();

  const [pegada, setPegada] = useState(null);
  const [pontos, setPontos] = useState(0);
  const [qtdVouchers, setQtdVouchers] = useState(0);
  const [vouchersUtilizados, setVouchersUtilizados] = useState(0);
  const [icones, setIcones] = useState([]);
  const [carregando, setCarregando] = useState(true);
  

  
  
const abrirWhatsApp = async () => {
  const url = 'https://wa.me/5515996893760?text=Olá!%20Quero%20saber%20mais%20sobre%20o%20EcoVoucher.';
  console.log("Abrindo WhatsApp...");

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    Linking.openURL(url);
  } else {
    Alert.alert('Erro', 'Não foi possível abrir o WhatsApp. Verifique se o aplicativo está instalado.');
  }
};

  const mensagens = [
    { texto: '🌱 Acompanhe sua pegada ecológica.' },
    { texto: '📍 Encontre pontos de coleta próximos de você.' },
    { texto: '🌍 Contribua com os ODS da ONU.' },
  ];

useEffect(() => {
  if (!usuario) {
    setCarregando(false);
    return;
  }

  let intervalo;

  const carregarDados = async () => {
    try {
      setCarregando(true);

      const documento = apenasNumeros(usuario.cpf ?? usuario.cnpj ?? "");

      // -- Usuário (PF/PJ)
      const u = await UsuarioService.obterPorId(documento);
      if (u.ok) {
        setPontos(u.data?.pontos ?? 0);

        if (usuario.tipo === "pf") {
          setPegada(u.data?.pontuacao ?? 0);

          setIcones([
            { imagem: require("../../assets/imagensEco/historicoIcon.png"), rota: "/historicopontos", label: "Histórico \nde Pontos" },
            { imagem: require("../../assets/imagensEco/catalogoIcon.png"), rota: "/catalogovoucherspf", label: "Vouchers \npara Troca" },
            { imagem: require("../../assets/imagensEco/pontoColetaIcon.png"), rota: "/pontoscoleta", label: "Pontos \nde Coleta" },
          ]);
        }
      } else {
        console.warn("Home obterPorId:", u.error);
      }

      // -- Estatísticas PJ
      if (usuario.tipo === "pj") {
        const [lv, est] = await Promise.all([
          VouchersService.listarVouchers(),
          VouchersService.obterEstatisticas(),
        ]);

        const totalGerados = lv.ok
          ? (lv.data ?? []).reduce((acc, v) => acc + (v.quantidade || 0), 0)
          : 0;
        setQtdVouchers(totalGerados);

        setVouchersUtilizados(est.ok ? est.data?.totalComprados ?? 0 : 0);

        setIcones([
          { imagem: require("../../assets/imagensEco/gerarVoucherIcon.png"), rota: "/catalogorecompensapj", label: "Gerar Voucher" },
          { imagem: require("../../assets/imagensEco/validarVoucherIcon.png"), rota: "/validarvoucherpj", label: "Validar Voucher" },
          {
            imagem: require("../../assets/imagensEco/faleConoscoIcon.png"),
            label: "Contato",
            onPress: abrirWhatsApp,
          },
        ]);
      }
    } catch (error) {
      const mensagem = obterMensagemErro(error, "Erro ao carregar dados da Home.");
      console.warn("⚠️ Erro na Home:", mensagem);
    } finally {
      setCarregando(false);
    }
  };

  carregarDados();
  intervalo = setInterval(carregarDados, 10000);

  return () => {
    clearInterval(intervalo);
    setPontos(0);
    setPegada(null);
    setQtdVouchers(0);
    setVouchersUtilizados(0);
    setIcones([]);
  };
}, [usuario]);


  return (
    <View style={styles.container}>
          <View style={styles.blocoInformativo}>
          <View style={styles.cabecalho}>
            <Image source={require ('../../assets/imagensEco/ecoVoucherIcon.png')} style={styles.logo} />
            <View style={styles.boasVindas}>
              <Text style={[styles.titulo, { fontSize: isLargeScreen ? fonts.size.xl : fonts.size.lg }]}>Olá, {(usuario?.nome || usuario?.nomeEmpresa || '').replace(/\b\w/g, l => l.toUpperCase())}
</Text>
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
              <TouchableOpacity onPress={() => router.push('/pegada')} style={[styles.botaoPrincipal, { width: isLargeScreen ? 220 : 180 }]}>
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
              <AnimatedCard
                key={index}
                imagem={item.imagem}
                rota={item.rota}
                label={item.label}
                onPress={item.onPress} // ✅ ESSENCIAL para funcionar
              />
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
