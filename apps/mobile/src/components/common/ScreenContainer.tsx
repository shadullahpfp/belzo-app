import React from 'react';
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets, EdgeInsets } from 'react-native-safe-area-context';

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  backgroundColor?: string;
  statusBarStyle?: 'light-content' | 'dark-content';
  enableKeyboardAvoiding?: boolean;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/**
 * Belzo Universal Screen Container
 * Ensures uniform layout, notch/island safety, and status bar styling across iOS and Android.
 */
export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  style,
  backgroundColor = '#F8F9FD',
  statusBarStyle = 'dark-content',
  enableKeyboardAvoiding = true,
  edges = ['top', 'bottom', 'left', 'right'],
}) => {
  const insets: EdgeInsets = useSafeAreaInsets();

  const containerPadding: ViewStyle = {
    paddingTop: edges.includes('top')
      ? Platform.select({
          ios: insets.top,
          android: StatusBar.currentHeight ? StatusBar.currentHeight : insets.top,
          default: insets.top,
        })
      : 0,
    paddingBottom: edges.includes('bottom') ? insets.bottom : 0,
    paddingLeft: edges.includes('left') ? insets.left : 0,
    paddingRight: edges.includes('right') ? insets.right : 0,
  };

  const content = (
    <View style={[styles.inner, { backgroundColor }, containerPadding, style]}>
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={Platform.OS === 'android' ? 'transparent' : undefined}
        translucent={Platform.OS === 'android'}
      />
      {children as any}
    </View>
  );

  if (enableKeyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={[styles.keyboardView, { backgroundColor }]}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        keyboardVerticalOffset={Platform.select({ ios: 0, android: 0 })}
      >
        {content}
      </KeyboardAvoidingView>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default ScreenContainer;
