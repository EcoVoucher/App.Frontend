import React from 'react';
import {
  Modal, View, Text, StyleSheet, Alert, Image,
} from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import BotaoVerde from './BotaoVerde';
import logoEcoApp from '../assets/imagensEco/eco-novo.jpeg';

export default function ModalComprovante({ visible, onClose, extrato }) {
  if (!extrato) return null;

  // 🧾 Gera HTML para exportação do PDF
  const gerarHtml = () => {
    const { cpf, dataHora, codigo, materiais, total } = extrato;
    return `
      <html>
        <head>
          <meta charset="UTF-8" />
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; text-align: center; }
            h1 { color: #076921; margin-top: 0; }
            ul { padding-left: 16px; text-align: left; display: inline-block; }
            .total { font-weight: bold; margin-top: 16px; color: #076921; }
            .info { margin-top: 10px; font-size: 14px; color: #333; }
          </style>
        </head>
        <body>
        <img src="data:image/jpeg;base64,SEU-BASE64-AQUI" style="width: 120px; margin-bottom: 20px;" />
          <h1>Comprovante de Depósito</h1>
          <p class="info">Código: ${codigo}</p>
          <p class="info">CPF: ${cpf}</p>
          <p class="info">Data/Hora: ${dataHora}</p>
          <ul>
            ${materiais.map(item => `
              <li>${item.nome}: ${item.quantidade} x ${item.pontos} pts = ${item.quantidade * item.pontos} pts</li>
            `).join('')}
          </ul>
          <p class="total">Total: ${total} pontos</p>
        </body>
      </html>
    `;
  };

  const imprimirComprovante = async () => {
    try {
      const html = gerarHtml();
      if (!html) throw new Error('Conteúdo HTML inválido.');

      const result = await Print.printToFileAsync({ html });
      if (!result?.uri) throw new Error('Falha ao gerar o PDF.');

      await Sharing.shareAsync(result.uri);
    } catch (error) {
      Alert.alert('Erro ao gerar PDF', error.message);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          <Image source={logoEcoApp} style={styles.logo} resizeMode="contain" />

          <Text style={styles.titulo}>✅ Depósito Registrado com Sucesso!</Text>
          <Text style={styles.codigo}>Código: {extrato.codigo}</Text>
          <Text style={styles.info}>CPF: {extrato.cpf}</Text>
          <Text style={styles.info}>Data/Hora: {extrato.dataHora}</Text>

          {extrato.materiais.map((item, idx) => (
            <Text key={idx} style={styles.texto}>
              {item.nome}: {item.quantidade} x {item.pontos} pts = {item.quantidade * item.pontos} pts
            </Text>
          ))}

          <Text style={styles.total}>Total: {extrato.total} pontos</Text>

          <View style={styles.botoesContainer}>
            <BotaoVerde texto="Imprimir PDF" onPress={imprimirComprovante} />
          </View>

          <Text style={styles.fechar} onPress={onClose}>Fechar</Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: colors.branco,
    padding: spacing.lg,
    borderRadius: 10,
    width: '90%',
    maxWidth: 500,
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 90,
    marginBottom: spacing.md,
  },
  titulo: {
    fontSize: fonts.size.lg,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  codigo: {
    fontSize: fonts.size.sm,
    fontWeight: 'bold',
    color: colors.textDark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  info: {
    fontSize: fonts.size.sm,
    color: colors.textDark,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  texto: {
    fontSize: fonts.size.sm,
    marginBottom: 4,
    textAlign: 'center',
  },
  total: {
    fontWeight: 'bold',
    marginTop: spacing.md,
    fontSize: fonts.size.md,
    color: colors.verde,
    textAlign: 'center',
  },
  botoesContainer: {
    marginTop: spacing.md,
    width: '100%',
  },
  fechar: {
    marginTop: spacing.md,
    textAlign: 'center',
    color: colors.cinza,
    textDecorationLine: 'underline',
    fontSize: fonts.size.sm,
  },
});
