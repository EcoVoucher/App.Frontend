
import { View, StyleSheet } from 'react-native';
import BotaoVerdePequeno from './BotaoVerdePequeno';
import { spacing } from '../theme/spacing';

export default function VerMaisMenos({
  mostrarTodos,
  temMais,
  onVerMais,
  onVerMenos,
  carregando = false,
}) {
  return (
    <View style={styles.container}>
      {!mostrarTodos && temMais && (
        <BotaoVerdePequeno
          texto="Ver mais ▼"
          onPress={onVerMais}
          carregando={carregando}
        />
      )}
      

      {(mostrarTodos || (!temMais)) && (
        <BotaoVerdePequeno
          texto="Ver menos ▲"
          onPress={onVerMenos}
          carregando={carregando}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: spacing.sm,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
  },
});
