// components/ModalErro.js
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { colors } from "../theme/colors";
import { spacing } from "../theme/spacing";
import { fonts } from "../theme/fonts";

const { width, height } = Dimensions.get("window");

function renderMensagem(mensagem) {
  if (mensagem == null) return <Text style={styles.mensagem}>Ocorreu um erro.</Text>;

  // string ou número
  if (typeof mensagem === "string" || typeof mensagem === "number") {
    return <Text style={styles.mensagem}>{String(mensagem)}</Text>;
  }

  // arrays/objetos (mostra chaves principais sem "spamar")
  try {
    if (Array.isArray(mensagem)) {
      const preview = JSON.stringify(mensagem.slice(0, 3));
      return <Text style={styles.mensagem}>{preview}{mensagem.length > 3 ? " ..." : ""}</Text>;
    }
    const keys = Object.keys(mensagem).slice(0, 5);
    return (
      <View style={{ gap: 4 }}>
        {keys.map((k) => (
          <Text key={k} style={styles.mensagem}>
            {k}: {JSON.stringify(mensagem[k])}
          </Text>
        ))}
        {Object.keys(mensagem).length > 5 && (
          <Text style={styles.mensagem}>…</Text>
        )}
      </View>
    );
  } catch {
    return <Text style={styles.mensagem}>{String(mensagem)}</Text>;
  }
}

export default function ModalErro({ visivel, mensagem, onClose }) {
  return (
    <Modal transparent animationType="fade" visible={visivel} onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.box} onPress={() => { /* evita fechar ao tocar dentro */ }}>
          <Text style={styles.titulo}>❌ Ocorreu um erro</Text>
          <View style={styles.scrollArea}>{renderMensagem(mensagem)}</View>
          <TouchableOpacity onPress={onClose} style={styles.botao}>
            <Text style={styles.botaoTexto}>OK</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(74, 74, 74, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  box: {
    backgroundColor: colors.branco,
    padding: spacing.lg,
    borderRadius: 20,
    width: width > 600 ? "60%" : "90%",
    maxHeight: height * 0.8,
    alignItems: "center",
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.erro,
    marginBottom: spacing.md,
    textAlign: "center",
  },
  scrollArea: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  mensagem: {
    fontSize: fonts.size.md,
    color: colors.preto,
    textAlign: "center",
  },
  botao: {
    backgroundColor: colors.erro,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: 12,
  },
  botaoTexto: {
    color: colors.branco,
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
  },
});
