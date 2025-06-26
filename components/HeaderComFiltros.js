// components/HeaderComFiltros.js
import { ScrollView, StyleSheet, Text, View,Image } from 'react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';
import BotaoVerdePequeno from './BotaoVerdePequeno';

export default function HeaderComFiltros({ 
  titulo, 
  subtitulo, 
  saldo, 
  tipos = [], 
  tipoSelecionado, 
  onSelecionarTipo,
  acoes,
  filtros,
}) {
  return (
    <View style={styles.boxResumo}>
      <Image source={require ('../assets/imagensEco/ecoVoucherIcon.png')} style={styles.logo} />
      {titulo && <Text style={styles.titulo}>{titulo}</Text>}
      {subtitulo && <Text style={styles.subtitulo}>{subtitulo}</Text>}
      {saldo !== undefined && saldo !== '' && (
      <Text style={styles.saldo}>
        {typeof saldo === 'number'
          ? `🥇 Saldo atual: ${saldo} pontos`
          : saldo}
      </Text>
    )}

 {filtros && <View style={{ marginBottom: spacing.md }}>{filtros}</View>}

  {tipos.length > 0 && (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={styles.filtrosLinha}
  >
    {tipos.map((tipo) => (
      <BotaoVerdePequeno
        key={tipo}
        texto={tipo}
        onPress={() => onSelecionarTipo(tipo)}
        ativo={tipo === tipoSelecionado}
      />
    ))}
  </ScrollView>
)}

  {/* Linha de ações customizadas (ex: botão de cadastro, select) */}
      {acoes && <View style={{ marginTop: spacing.md }}>{acoes}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  boxResumo: {
    backgroundColor: colors.branco,
    borderRadius: 12,
    marginBottom: spacing.lg,
    padding: spacing.md,
  },
   logo: {
  width: 80,
  height: 80,
  resizeMode: 'contain',
  alignSelf: 'center', // ✅ Centraliza horizontalmente
},
  titulo: {
    fontSize: fonts.size.xl,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  subtitulo: {
    fontSize: fonts.size.md,
    fontWeight: fonts.weight.bold,
    color: colors.verde,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  saldo: {
    textAlign: 'center',
    fontSize: fonts.size.md,
    color: colors.verde,
    marginBottom: spacing.md,
  },
 filtrosLinha: {
  flexDirection: 'row',
  justifyContent: 'center', 
  alignItems: 'center',
  gap: spacing.sm,
  paddingHorizontal: spacing.sm,
  minWidth: '100%', 
},

});
