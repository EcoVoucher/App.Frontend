import {
  View,
  TextInput,
  StyleSheet,
  Platform,
  TouchableOpacity,
} from 'react-native';
import MaskInput from 'react-native-mask-input';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';

export default function InputText({
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  mask = null,
  mostrarSenha = null,
  alternarSenha = null,
  style,
  containerStyle,
  ...rest
}) {
  const InputComponent = mask ? MaskInput : TextInput;

  return (
    <View style={[styles.container, containerStyle]}>
      <InputComponent
       value={value ?? ''} // ✅ sempre controlado
       onChangeText={
        mask ? (masked /*, unmasked */) => onChangeText?.(masked) : onChangeText
      }
        placeholder={placeholder}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        {...(mask ? { mask } : {})}
        placeholderTextColor={colors.cinzaClaro}
        style={[styles.input, style]}
        {...rest} // inclui editable
      />

      {typeof mostrarSenha === 'boolean' && alternarSenha && (
        <TouchableOpacity onPress={alternarSenha} style={styles.iconBox}>
          <Ionicons
            name={mostrarSenha ? 'eye-off' : 'eye'}
            size={22}
            color={colors.cinza}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderWidth: 1.2,
    borderColor: colors.borda,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.branco,
    alignItems: 'center',
    width: '100%',
    minHeight: 48,
  },
  input: {
    flex: 1,
    fontSize: fonts.size.md,
    paddingVertical: Platform.OS === 'android' ? 10 : 12,
    paddingRight: 36,
    color: colors.preto,
  },
  iconBox: { position: 'absolute', right: 12, padding: 4 },
});
