import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  Modal,
  TouchableOpacity,
  Linking,
} from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

import { Masks } from 'react-native-mask-input';
import InputField from '../../components/InputField';
import BotaoVerde from '../../components/BotaoVerde';
import ModalErro from '../../components/ModalErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
import { PontoColetaService } from '../../services/pontoColetaService';
import { Ionicons } from '@expo/vector-icons';
import { obterMensagemErro } from '../../utils/obterMensagemErro';

export default function BuscarPontosColeta() {
  const [cep, setCep] = useState('');
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState([]);
  const [visivelErro, setVisivelErro] = useState(false);
  const [modalResultado, setModalResultado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mensagemErro, setMensagemErro] = useState('');

  const handleFecharModal = () => {
    setModalResultado(false); 
    setCep('');              
    setErro('');              
    setResultados([]);       
  };

  const abrirNoMapa = (endereco) => {
    const enderecoFormatado = encodeURIComponent(endereco);
    const url = Platform.select({
      ios: `maps://app?q=${enderecoFormatado}`,
      android: `geo:0,0?q=${enderecoFormatado}`,
    });
    
    // Fallback para Google Maps web se o app nativo não abrir
    const urlWeb = `https://www.google.com/maps/search/?api=1&query=${enderecoFormatado}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(urlWeb);
      }
    }).catch(() => {
      Linking.openURL(urlWeb);
    });
  };

  const handleBuscar = async () => {
    const erros = validarCamposObrigatorios({ cep }, ['cep']);

    if (erros.cep) {
      setErro(erros.cep);
      return;
    }
    setErro('');

    if (isLoading) return; 
    setIsLoading(true);

    try {
      // ✅ Usando a busca com ViaCEP + cálculo de distância
      const dados = await PontoColetaService.buscarPontosPorCep(cep);

      if (dados.length === 0) {
        setMensagemErro('Nenhum ponto de coleta encontrado em um raio de 10km.');
        setVisivelErro(true);
        return;
      }

      setResultados(dados);
      setModalResultado(true);

    } catch (error) {
      const mensagem = obterMensagemErro(error, 'Erro ao buscar pontos de coleta.');
      setMensagemErro(mensagem);  
      setVisivelErro(true);          
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.titulo}>Buscar Pontos de Coleta</Text>
        <Text style={styles.subtitulo}>Digite seu CEP para localizar pontos próximos.</Text>
        <View style={styles.inputContainer}>
          <InputField
            placeholder="Digite seu CEP"
            value={cep}
            onChangeText={setCep}
            mask={Masks.ZIP_CODE}
            error={erro}
          />
        </View>
        <BotaoVerde
          texto={isLoading ? "Buscando..." : "Buscar Pontos de Coleta"}
          onPress={handleBuscar}
          disabled={isLoading}
        />
        <Modal
          transparent
          animationType="fade"
          visible={modalResultado}
          onRequestClose={handleFecharModal}>
          
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/imagensEco/ecoVoucherIcon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity 
                onPress={handleFecharModal} 
                style={styles.botaoFechar} 
              >
                <Ionicons name="close" size={28} color={colors.verde} />
              </TouchableOpacity>
              
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitulo}>Pontos de Coleta Encontrados</Text>
              </View>

              <ScrollView 
                style={{ width: '100%' }}
                contentContainerStyle={{ alignItems: 'center' }}
                showsVerticalScrollIndicator={false}>
                {resultados.length > 0 ? (
                  resultados.map((item, index) => (
                    <View key={index} style={styles.card}>
                      <Text style={styles.cardTitulo}>{item.nome}</Text>
                      <TouchableOpacity onPress={() => abrirNoMapa(item.endereco)}>
                        <Text style={styles.cardEndereco}>📍 {item.endereco}</Text>
                      </TouchableOpacity>
                      <Text style={styles.cardTexto}>📏 Distância: {item.distancia} km</Text>
                      {item.observacao ? (
                        <Text style={styles.cardTexto}>ℹ️ {item.observacao}</Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.naoEncontrado}>Nenhum ponto de coleta encontrado.</Text>
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        <ModalErro
          visivel={visivelErro}
          onFechar={() => setVisivelErro(false)}
          mensagem={mensagemErro}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.branco,
  },
  content: {
    flexGrow: 1,
    padding: spacing.medium,
    alignItems: 'center',      
    justifyContent: 'center',  
    gap: spacing.large,      
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
  },
  inputContainer: {
    width: '90%',
    alignItems: 'center',
  },
  titulo: {
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
    fontSize: fonts.extraLarge,
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: fonts.medium,
    textAlign: 'center',
    marginVertical: spacing.small,
    padding: spacing.md,
    paddingBottom: spacing.lg,
  },
  overlay: {
    flex: 1,
    backgroundColor: colors.cinza,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: colors.branco,
    borderRadius: 16,
    padding: spacing.large,
    width: '90%',
    maxHeight: '80%',
  },
  botaoFechar: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    padding: 8,
    zIndex: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  modalTitulo: {
    fontSize: fonts.size?.xl || fonts.extraLarge,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    justifyContent: "center",
    fontWeight: 'bold',
    color: colors.verde,
    textAlign: 'center',
    flex: 1,  
  },
  card: {
    backgroundColor: colors.verdeClaro,
    borderRadius: 16,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    marginVertical: spacing.small,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 4,
  },
  cardTitulo: {
    fontSize: fonts.large + 2,
    color: colors.primary,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
  },
  cardEndereco: {
    fontSize: fonts.medium,
    color: colors.verde,
    marginBottom: spacing.xs,
    textDecorationLine: 'underline',
  },
  cardTexto: {
    fontSize: fonts.medium,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  naoEncontrado: {
    fontSize: fonts.medium,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.large,
  },
});