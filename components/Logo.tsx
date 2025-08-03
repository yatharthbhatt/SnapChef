import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChefHat, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/components/ThemeProvider';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
}

export function Logo({ size = 'medium', showText = true }: LogoProps) {
  const { colors } = useTheme();
  
  const sizes = {
    small: { icon: 24, text: 16, container: 60 },
    medium: { icon: 32, text: 20, container: 80 },
    large: { icon: 48, text: 28, container: 120 },
  };

  const currentSize = sizes[size];

  return (
    <View style={styles.container}>
      <View style={[styles.logoContainer, { width: currentSize.container, height: currentSize.container }]}>
        <LinearGradient
          colors={['#10b981', '#059669']}
          style={styles.gradient}
        >
          <ChefHat size={currentSize.icon} color="white" strokeWidth={2} />
          <View style={styles.sparkle}>
            <Sparkles size={currentSize.icon * 0.4} color="#fbbf24" strokeWidth={2} />
          </View>
        </LinearGradient>
      </View>
      {showText && (
        <Text style={[styles.logoText, { fontSize: currentSize.text, color: colors.text }]}>
          SnapChef
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  sparkle: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  logoText: {
    fontFamily: 'Poppins-Bold',
    marginTop: 8,
  },
});