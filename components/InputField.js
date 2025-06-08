import { Text, View, StyleSheet } from 'react-native';
import InputText from './InputText';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function InputField({
  label,
  value,
  onChangeText,
  error,
  style,
  containerStyle,
  ...rest
}) {
  const isValid = value?.trim() && !error;

  const combinedContainerStyle = [
    styles.inputContainer,
    isValid
      ? { borderColor: colors.sucesso }
      : error
      ? { borderColor: colors.erro }
      : { borderColor: colors.borda },
    containerStyle,
  ];

  return (
    <View style={styles.wrapper}>
      {label && <Text style={styles.label}>{label}</Text>}
      <InputText
        value={value}
        onChangeText={onChangeText}
        containerStyle={combinedContainerStyle}
        style={style}
        {...rest}
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.sm, // reduzido para diminuir o espaço entre os campos
    width: '100%',
  },
  label: {
    fontSize: fonts.size.sm,
    marginBottom: spacing.xs,
    color: colors.preto,
  },
  inputContainer: {
    borderWidth: 1.2,
    borderRadius: 8,
    backgroundColor: colors.branco,
    paddingHorizontal: spacing.sm,
    height: 48,
    justifyContent: 'center',
    width: '100%',
  },
  error: {
    marginTop: 4,
    fontSize: fonts.size.xs,
    color: colors.erro,
  },
});
