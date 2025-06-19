import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

export default function ModalErro({ visivel, mensagem, onClose }) {
  return (
    <Modal transparent animationType="fade" visible={visivel} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Text style={styles.titulo}>❌ Ocorreu um erro</Text>

          <View style={styles.scrollArea}>
              {typeof mensagem === 'object' ? (
                Object.entries(mensagem).map(([chave, valor]) => (
                  <Text key={chave} style={styles.mensagem}>
                    {chave}: {JSON.stringify(valor)}
                  </Text>
                ))
              ) : (
                <Text style={styles.mensagem}>{mensagem}</Text>
              )}
            </View>

          <TouchableOpacity onPress={onClose} style={styles.botao}>
            <Text style={styles.botaoTexto}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(74, 74, 74, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  box: {
    backgroundColor: colors.branco,
    padding: spacing.lg,
    borderRadius: 20,
    width: width > 600 ? '60%' : '90%',
    maxHeight: height * 0.8,
    alignItems: 'center',
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.erro,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  scrollArea: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  mensagem: {
    fontSize: fonts.size.md, // 🔥 Aumentado
    color: colors.preto,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: colors.erro,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl, // 🔥 Mais largo
    borderRadius: 12,
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: fonts.size.md, // 🔥 Aumentado
    fontWeight: fonts.weight.bold,
  },
});
