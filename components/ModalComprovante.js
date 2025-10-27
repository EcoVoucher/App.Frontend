import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import logoEcoApp from '../assets/imagensEco/eco-novo.jpeg';

export default function ModalComprovante({ visible, onClose, extrato }) {
  if (!visible || !extrato) return null;

  const materiais = Array.isArray(extrato.materiais) ? extrato.materiais : [];
  const total = Number(extrato.total) || 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {/* Logo */}
          <Image source={logoEcoApp} style={styles.logo} resizeMode="contain" />

          {/* Título */}
          <Text style={styles.titulo}>✅ Depósito Registrado com Sucesso!</Text>

          {/* Mensagem fixa */}
          <Text style={styles.mensagemEmail}>
            O comprovante foi enviado para o e-mail cadastrado.
          </Text>

          {/* Informações principais */}
          {extrato.cpf ? <Text style={styles.info}>CPF: {extrato.cpf}</Text> : null}
          {extrato.dataHora ? (
            <Text style={styles.info}>Data/Hora: {extrato.dataHora}</Text>
          ) : null}

          {/* Materiais depositados */}
          {materiais.map((item, idx) => {
            const qtd = Number(item.quantidade) || 0;
            const pts = Number(item.pontos) || 0;
            const subtotal = qtd * pts;
            return (
              <Text key={idx} style={styles.item}>
                {item.nome}: {qtd} x {pts} pts = {subtotal} pts
              </Text>
            );
          })}

          {/* Total */}
          <Text style={styles.total}>Total: {total} pontos</Text>

          {/* Botão Fechar */}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.fechar}>Fechar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  modalBox: {
    backgroundColor: colors.branco,
    borderRadius: 10,
    width: '90%',
    maxWidth: 480,
    padding: spacing.lg,
    alignItems: 'center',
    elevation: 5,
  },
  logo: {
    width: 110,
    height: 80,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  mensagemEmail: {
    fontSize: fonts.size.md,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  info: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
    marginBottom: 4,
    textAlign: 'center',
  },
  item: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
    textAlign: 'center',
    marginBottom: 2,
  },
  total: {
    fontSize: fonts.size.md,
    color: colors.verde,
    fontWeight: 'bold',
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  fechar: {
    marginTop: spacing.md,
    fontSize: fonts.size.sm,
    color: colors.cinza,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
});
