import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { spacing } from '../theme/spacing';

export default function SelectField({
  label,
  selectedValue,
  onValueChange,
  options,
  error,
  placeholder = 'Selecione uma opção',     // opcional
  containerStyle,                           // opcional
  enabled = true,                           // opcional
  ...rest
}) {
  const isValid = !!selectedValue && !error;

  const containerSty = [
    styles.pickerContainer,
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
      <View style={containerSty}>
        <Picker
          selectedValue={selectedValue}
          onValueChange={onValueChange}
          style={styles.picker}
          dropdownIconColor={colors.preto}
          enabled={enabled}
          {...rest}
        >
          <Picker.Item label={placeholder} value="" />
          {options.map((opcao, index) => (
            <Picker.Item key={index} label={opcao.label} value={opcao.value} />
          ))}
        </Picker>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.lg,
    width: '100%',
  },
  label: {
    fontSize: fonts.size.sm,
    marginBottom: spacing.xs,
    color: colors.preto,
  },
  pickerContainer: {
    borderWidth: 1.2,
    borderRadius: 8,
    backgroundColor: colors.branco,
    paddingHorizontal: spacing.sm,
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'android' ? 55 : 'auto',
    width: '100%',
    color: colors.preto,
    fontSize: fonts.size.md,
  },
  error: {
    marginTop: 4,
    fontSize: fonts.size.xs,
    color: colors.erro,
  },
});
