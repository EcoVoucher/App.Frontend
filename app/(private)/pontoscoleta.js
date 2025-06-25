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

export default function BuscarPontosColeta() {
  const [cep, setCep] = useState('');
  const [erro, setErro] = useState('');
  const [resultados, setResultados] = useState([]);
  const [visivelErro, setVisivelErro] = useState(false);
  const [modalResultado, setModalResultado] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localizacao, setLocalizacao] = useState(null);
  const [pontoMaisProximo, setPontoMaisProximo] = useState(null);


    const handleFecharModal = () => {
      setModalResultado(false); 
      setCep('');              
      setErro('');              
      setResultados([]);       
};

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Retorna distância em KM
};

const obterCoordenadas = async (cep) => {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cep)}`
  );
  const data = await response.json();

  if (data.length > 0) {
    return {
      latitude: parseFloat(data[0].lat),
      longitude: parseFloat(data[0].lon),
    };
  } else {
    throw new Error('Endereço não encontrado');
  }
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
      const coords = await obterCoordenadas(cep);
      setLocalizacao(coords);

      const dados = [
        {
          id: '1',
          nome: 'Tauste Campolim',
          endereco: 'Av. Antônio Carlos Comitre, 1200 - Campolim',
          latitude: -23.522632,
          longitude: -47.452447,
          descricao: 'Aceita: plástico, papel e vidro.',
          telefone: '(15) 3219-9000',
        },
        {
          id: '2',
          nome: 'Confiança Supermercados',
          endereco: 'Av. Dr. Armando Pannunzio, 1936 - Jardim Vera Cruz',
          latitude: -23.503650,
          longitude: -47.492108,
          descricao: 'Aceita: plástico, alumínio e óleo.',
          telefone: '(15) 3418-4000',
        },
        {
          id: '3',
          nome: 'Atacadão Sorocaba',
          endereco: 'Av. Independência, 3475 - Éden',
          latitude: -23.532207,
          longitude: -47.420020,
          descricao: 'Aceita: plástico, papelão e alumínio.',
          telefone: '(15) 3238-6800',
        }
      ];

      const dadosComDistancia = dados.map((p) => ({
        ...p,
        distancia: calcularDistancia(
          coords.latitude,
          coords.longitude,
          p.latitude,
          p.longitude
        ).toFixed(2),
      }));

      const maisProximo = dadosComDistancia.reduce((prev, current) =>
        prev.distancia < current.distancia ? prev : current
      );

      setPontoMaisProximo(maisProximo);
      setResultados(dadosComDistancia);
      setModalResultado(true);
    } catch (e) {
      console.log(e);
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

              {localizacao && (
                <MapView
                  style={styles.mapa}
                  initialRegion={{
                    latitude: localizacao.latitude,
                    longitude: localizacao.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                  }}>
                  <Marker
                    coordinate={{
                      latitude: localizacao.latitude,
                      longitude: localizacao.longitude,
                    }}
                    title="Sua Localização"
                    pinColor="blue"
                  />
                  {resultados.map((item) => (
                    <Marker
                      key={item.id}
                      coordinate={{
                        latitude: item.latitude,
                        longitude: item.longitude,
                      }}
                      title={item.nome}
                      description={item.observacao}
                      pinColor={item.id === pontoMaisProximo?.id ? 'green' : 'red'}
                    />
                  ))}
                </MapView>
              )}

              <ScrollView style={{ width: '100%' }}
              contentContainerStyle={{ alignItems: 'center' }}
              showsVerticalScrollIndicator={false}>
                {resultados.length > 0 ? (
                  resultados.map((item, index) => (
                    <View key={index} style={styles.card}>
                      <Text style={styles.cardTitulo}>
                          {item.nome} {item.id === pontoMaisProximo?.id ? '⭐ Mais Próximo' : ''}
                        </Text>
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
mapa: {
  width: '100%',
  height: 250,
  borderRadius: 16,
  marginBottom: spacing.lg,
},

});