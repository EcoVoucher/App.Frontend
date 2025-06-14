import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

export default function ModalSucesso({ visivel, onFechar, mensagem }) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visivel}
      onRequestClose={onFechar}
    >
      <View style={styles.container}>
        <View style={styles.box}>
          <Image
            source={require('../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.modalLogo}
            resizeMode="contain"
            />
          <Text style={styles.titulo}>Sucesso</Text>

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.mensagem}>{mensagem}</Text>
          </ScrollView>

          <TouchableOpacity onPress={onFechar} style={styles.botao}>
            <Text style={styles.botaoTexto}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  box: {
    backgroundColor: colors.branco,
    padding: spacing.lg,
    borderRadius: 12,
    width: width > 600 ? '60%' : '90%',
    maxHeight: height * 0.8,
    alignItems: 'center',
  },
  modalLogo: {
  width: 60,
  height: 60,
  marginBottom: spacing.sm,
},
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  scrollArea: {
    maxHeight: height * 0.35,
    width: '100%',
    marginBottom: spacing.md,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  mensagem: {
    fontSize: fonts.size.sm,
    color: colors.preto,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: colors.verde,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: fonts.size.sm,
    fontWeight: fonts.weight.medium,
  },
});
