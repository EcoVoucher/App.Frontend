import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';

export default function ModalErro({ visivel, mensagem, onClose }) {
  return (
    <Modal transparent visible={visivel} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.texto}>{mensagem}</Text>
          <TouchableOpacity onPress={onClose} style={styles.botao}>
            <Text style={styles.textoBotao}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#00000099',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: colors.branco,
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  texto: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: colors.vermelho || 'red',
  },
  botao: {
    backgroundColor: colors.vermelho || 'red',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 6,
    
  },
  textoBotao: {
    color: 'white',
    fontWeight: 'bold',
  },
});
