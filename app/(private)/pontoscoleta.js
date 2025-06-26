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
} from 'react-native';

import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

import { Masks } from 'react-native-mask-input';
import InputField from '../../components/InputField';
import BotaoVerde from '../../components/BotaoVerde';
import ModalErro from '../../components/ModalErro';
import { validarCamposObrigatorios } from '../../utils/validarCamposObrigatorios';
//import { PontoColetaService } from '../../services/pontoColetaService';
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
      // 🔗 Quando estiver usando API real, descomenta abaixo:
      // const dados = await PontoColetaService.buscarPontosPorCep(cep);

      // 🟩 Dados Mockados para teste no Front
      const dados = [
        {
          nome: 'Ponto Verde Central',
          endereco: 'Rua das Flores, 123 - Centro, Votorantim - SP, 18115-030',
          distancia: 1.2,
          observacao: 'Aceita plástico, papel e metal',
        },
        {
          nome: 'Eco Ponto Norte',
          endereco: 'Av. Brasil, 789 - Norte, Votorantim - SP, 18115-050',
          distancia: 2.8,
          observacao: 'Somente vidro',
        },
        {
          nome: 'Recicla Fácil',
          endereco: 'Rua do Meio, 456 - Sul, Votorantim - SP, 18115-070',
          distancia: 3.5,
          observacao: '',
        },
      ];

      } catch (error) {
  const mensagem = obterMensagemErro(error, 'Erro ao buscar resultados.');
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

              <ScrollView style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center' }}
              showsVerticalScrollIndicator={false}>
                {resultados.length > 0 ? (
                  resultados.map((item, index) => (
                    <View key={index} style={styles.card}>
                      <Text style={styles.cardTitulo}>{item.nome}</Text>
                      <Text style={styles.cardTexto}>📍 {item.endereco}</Text>
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
          mensagem="Ocorreu um erro ao buscar pontos de coleta. Tente novamente."
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 content: {
  flexGrow:1,
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
    paddingBottom:spacing.sm,
    paddingTop:spacing.md,
    fontSize: fonts.extraLarge,
    color: colors.primary,
    fontWeight: 'bold',
  },
  subtitulo: {
    fontSize: fonts.medium,
    textAlign: 'center',
    marginVertical: spacing.small,
    padding:spacing.md,
    paddingBottom:spacing.lg,
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
    maxHeight: '100%',
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
    fontSize: fonts.size.xl,
    paddingTop:spacing.md,
    paddingBottom:spacing.md,
    justifyContent:"center",
    fontWeight: 'bold',
    color: colors.verde,
    textAlign: 'center',
    flex: 1,  
  },
 card: {
  backgroundColor: colors.verdeClaro,
  borderRadius: 16,
  padding: spacing.lg,
  marginBottom:spacing.xl,
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
  color: colors.text,
  marginBottom: spacing.xs,
},
cardDetalhe: {
  fontSize: fonts.small,
  color: colors.textMuted,
  marginBottom: spacing.xs,
},
cardObservacao: {
  fontSize: fonts.small,
  color: colors.secondary,
  fontStyle: 'italic',
},
});