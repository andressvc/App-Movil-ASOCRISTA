import React, { forwardRef } from 'react';
import { TextInput, StyleSheet, View, Text } from 'react-native';
import { Colors, Theme } from '../constants/Colors';

const SimpleTextInput = forwardRef(({ 
  label,
  error,
  style,
  containerStyle,
  value,
  onChangeText,
  returnKeyType = "next",
  ...props 
}, ref) => {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        ref={ref}
        style={[
          styles.input,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor={Colors.gray[400]}
        value={value}
        onChangeText={onChangeText}
        autoCorrect={false}
        autoCapitalize="words"
        returnKeyType={returnKeyType}
        blurOnSubmit={false}
        editable={true}
        selectTextOnFocus={true}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    ...Theme.typography.callout,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: Theme.spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Theme.borderRadius.lg,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.md,
    ...Theme.typography.body,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
    minHeight: 48,
    ...Theme.shadows.sm,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '10',
  },
  errorText: {
    ...Theme.typography.footnote,
    color: Colors.error,
    marginTop: Theme.spacing.xs,
  },
});

export default SimpleTextInput;
