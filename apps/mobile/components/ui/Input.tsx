import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
}

/**
 * Apple-Grade High-Contrast Input
 * Rounded squircle (20px radius) with floating label behavior and subtle hairline border.
 */
export const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View
        style={[
          styles.container,
          isFocused ? styles.containerFocused : undefined,
          error ? styles.containerError : undefined,
        ]}
      >
        {leftIcon ? (
          <View style={styles.leftIconSlot}>{leftIcon as any}</View>
        ) : null}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor="#8E8E93"
          onFocus={(e) => {
            setIsFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          {...rest}
        />
        {rightIcon ? (
          <View style={styles.rightIconSlot}>{rightIcon as any}</View>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.2,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // Squircle geometry
    borderWidth: 0.5,
    borderColor: 'rgba(0, 0, 0, 0.08)',
    paddingHorizontal: 16,
    height: 54,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  containerFocused: {
    borderColor: '#FF5E00',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
  },
  containerError: {
    borderColor: '#FF3B30',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  leftIconSlot: {
    marginRight: 10,
  },
  rightIconSlot: {
    marginLeft: 10,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default Input;
