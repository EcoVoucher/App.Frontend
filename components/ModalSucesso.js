import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

const { width, height } = Dimensions.get('window');

export default function ModalSucesso({ visivel, onFechar, mensagem, titulo, exibirBotao = true }) {
  return (
    <Modal transparent animationType="fade" visible={visivel} onRequestClose={onFechar}>
      <View style={styles.overlay}>
        <View style={styles.box}>
          <Image
            source={require('../assets/imagensEco/ecoVoucherIcon.png')}
            style={styles.modalLogo}
            resizeMode="contain"
          />

          {titulo && <Text style={styles.titulo}>{titulo}</Text>}

          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {typeof mensagem === 'string' ? (
              <Text style={styles.mensagem}>{mensagem}</Text>
            ) : (
              mensagem
            )}
          </ScrollView>

          {exibirBotao && (
            <TouchableOpacity onPress={onFechar} style={styles.botao}>
              <Text style={styles.botaoTexto}>OK</Text>
            </TouchableOpacity>
          )}
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
  modalLogo: {
    width: 100,
    height: 100,
    marginBottom: spacing.sm,
  },
  titulo: {
    fontSize: fonts.size.lg, // 🔥 Título maior
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.md,
  },
  scrollArea: {
    maxHeight: height * 0.4,
    width: '100%',
    marginBottom: spacing.md,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
  },
  mensagem: {
    fontSize: fonts.size.md, // 🔥 Aumentado aqui
    color: colors.preto,
    textAlign: 'center',
  },
  botao: {
    backgroundColor: colors.verde,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
    marginTop: spacing.sm,
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: fonts.size.md, // 🔥 Aumentado
    fontWeight: fonts.weight.bold,
  },
});
