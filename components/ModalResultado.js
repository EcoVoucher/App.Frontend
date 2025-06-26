import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function ModalResultado({ visivel, onFechar, titulo, children }) {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visivel}
      onRequestClose={onFechar}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <Text style={styles.titulo}>{titulo || 'Resultados'}</Text>
            <TouchableOpacity onPress={onFechar}>
              <Ionicons name="close" size={24} color={colors.verde} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scroll}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: '#000000aa',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modal: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    width: '100%',
    maxHeight: '85%',
    padding: spacing.md,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
    borderBottomWidth: 1,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
  },
  scroll: {
    paddingBottom: spacing.lg,
  },
});
