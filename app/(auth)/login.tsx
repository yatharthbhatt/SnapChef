import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Mail, Lock, User, Phone, Eye, EyeOff } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/components/AuthProvider';
import { Logo } from '@/components/Logo';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function LoginScreen() {
  const { colors, isDarkMode } = useTheme();
  const { signIn, signUp, signInWithGoogle, signInWithApple, signInWithTwitter, signInWithPhone, sendSMSVerification, isLoading } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phone: '',
    verificationCode: '',
  });
  const [isCodeSent, setIsCodeSent] = useState(false);

  const loginButtonScale = useSharedValue(1);
  const googleButtonScale = useSharedValue(1);
  const appleButtonScale = useSharedValue(1);
  const twitterButtonScale = useSharedValue(1);

  const animatedLoginStyle = useAnimatedStyle(() => ({
    transform: [{ scale: loginButtonScale.value }]
  }));

  const animatedGoogleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: googleButtonScale.value }]
  }));

  const animatedAppleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: appleButtonScale.value }]
  }));

  const animatedTwitterStyle = useAnimatedStyle(() => ({
    transform: [{ scale: twitterButtonScale.value }]
  }));

  const handleEmailAuth = async () => {
    loginButtonScale.value = withSequence(withSpring(0.95), withSpring(1));
    
    try {
      if (authMethod === 'email') {
        if (isSignUp) {
          if (!formData.name || !formData.email || !formData.password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
          }
          await signUp(formData.email, formData.password, formData.name);
        } else {
          if (!formData.email || !formData.password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
          }
          await signIn(formData.email, formData.password);
        }
      } else {
        if (!isCodeSent) {
          if (!formData.phone) {
            Alert.alert('Error', 'Please enter phone number');
            return;
          }
          await sendSMSVerification(formData.phone);
          setIsCodeSent(true);
          Alert.alert('Success', 'Verification code sent to your phone');
        } else {
          if (!formData.verificationCode) {
            Alert.alert('Error', 'Please enter verification code');
            return;
          }
          await signInWithPhone(formData.phone, formData.verificationCode);
        }
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  const handleGoogleSignIn = async () => {
    googleButtonScale.value = withSequence(withSpring(0.95), withSpring(1));
    try {
      await signInWithGoogle();
    } catch (error) {
      Alert.alert('Google Sign In', error instanceof Error ? error.message : 'Google sign in failed');
    }
  };

  const handleAppleSignIn = async () => {
    appleButtonScale.value = withSequence(withSpring(0.95), withSpring(1));
    try {
      await signInWithApple();
    } catch (error) {
      Alert.alert('Apple Sign In', error instanceof Error ? error.message : 'Apple sign in failed');
    }
  };

  const handleTwitterSignIn = async () => {
    twitterButtonScale.value = withSequence(withSpring(0.95), withSpring(1));
    try {
      await signInWithTwitter();
    } catch (error) {
      Alert.alert('Twitter Sign In', error instanceof Error ? error.message : 'Twitter sign in failed');
    }
  };

  return (
    <LinearGradient 
      colors={isDarkMode ? ['#0a0a0b', '#1a1a2e'] : ['#f8fafc', '#e2e8f0']} 
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Logo size="large" showText={true} />
          <Text style={[styles.tagline, { color: colors.primary }]}>Eat Smart. Cook Fit. Live Better.</Text>
        </View>

        <View style={styles.authContainer}>
          <BlurView intensity={60} tint={isDarkMode ? "dark" : "light"} style={styles.authCard}>
            <View style={[styles.authContent, { borderColor: colors.border }]}>
              <Text style={[styles.authTitle, { color: colors.text }]}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={[styles.authSubtitle, { color: colors.textSecondary }]}>
                {isSignUp ? 'Join the SnapChef community' : 'Sign in to continue'}
              </Text>

              <View style={[styles.methodToggle, { backgroundColor: colors.cardBackground }]}>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    authMethod === 'email' && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => {
                    setAuthMethod('email');
                    setIsCodeSent(false);
                  }}
                >
                  <Mail size={16} color={authMethod === 'email' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.methodText,
                    { color: authMethod === 'email' ? colors.primary : colors.textSecondary }
                  ]}>Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.methodButton,
                    authMethod === 'phone' && { backgroundColor: colors.primary + '20' }
                  ]}
                  onPress={() => {
                    setAuthMethod('phone');
                    setIsCodeSent(false);
                  }}
                >
                  <Phone size={16} color={authMethod === 'phone' ? colors.primary : colors.textSecondary} />
                  <Text style={[
                    styles.methodText,
                    { color: authMethod === 'phone' ? colors.primary : colors.textSecondary }
                  ]}>Phone</Text>
                </TouchableOpacity>
              </View>

              {authMethod === 'email' ? (
                <>
                  {isSignUp && (
                    <View style={[styles.inputGroup, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                      <User size={20} color={colors.textSecondary} />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder="Full Name"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.name}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
                        autoCapitalize="words"
                      />
                    </View>
                  )}
                  
                  <View style={[styles.inputGroup, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Mail size={20} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Email Address"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.email}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={[styles.inputGroup, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Lock size={20} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Password"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.password}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <EyeOff size={20} color={colors.textSecondary} />
                      ) : (
                        <Eye size={20} color={colors.textSecondary} />
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                <>
                  <View style={[styles.inputGroup, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                    <Phone size={20} color={colors.textSecondary} />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Phone Number"
                      placeholderTextColor={colors.textSecondary}
                      value={formData.phone}
                      onChangeText={(text) => setFormData(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                      editable={!isCodeSent}
                    />
                  </View>

                  {isCodeSent && (
                    <View style={[styles.inputGroup, { backgroundColor: colors.inputBackground, borderColor: colors.border }]}>
                      <Lock size={20} color={colors.textSecondary} />
                      <TextInput
                        style={[styles.textInput, { color: colors.text }]}
                        placeholder="Verification Code"
                        placeholderTextColor={colors.textSecondary}
                        value={formData.verificationCode}
                        onChangeText={(text) => setFormData(prev => ({ ...prev, verificationCode: text }))}
                        keyboardType="numeric"
                        maxLength={6}
                      />
                    </View>
                  )}
                </>
              )}

              <AnimatedTouchable 
                style={[styles.authButton, animatedLoginStyle]}
                onPress={handleEmailAuth}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.authGradient}
                >
                  <Text style={styles.authButtonText}>
                    {isLoading ? 'Please wait...' : 
                     authMethod === 'phone' && !isCodeSent ? 'Send Code' :
                     authMethod === 'phone' && isCodeSent ? 'Verify Code' :
                     isSignUp ? 'Create Account' : 'Sign In'}
                  </Text>
                </LinearGradient>
              </AnimatedTouchable>

              {authMethod === 'email' && (
                <TouchableOpacity 
                  style={styles.toggleButton}
                  onPress={() => setIsSignUp(!isSignUp)}
                >
                  <Text style={[styles.toggleText, { color: colors.textSecondary }]}>
                    {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
                    <Text style={{ color: colors.primary }}>
                      {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Text>
                  </Text>
                </TouchableOpacity>
              )}

              <View style={styles.divider}>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
                <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with</Text>
                <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              </View>

              <View style={styles.socialButtons}>
                <AnimatedTouchable 
                  style={[styles.socialButton, animatedGoogleStyle]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <BlurView intensity={40} tint={isDarkMode ? "dark" : "light"} style={styles.socialBlur}>
                    <AntDesign name="google" size={24} color="#EA4335" />
                  </BlurView>
                </AnimatedTouchable>

                {Platform.OS === 'ios' && (
                  <AnimatedTouchable 
                    style={[styles.socialButton, animatedAppleStyle]}
                    onPress={handleAppleSignIn}
                    disabled={isLoading}
                  >
                    <BlurView intensity={40} tint={isDarkMode ? "dark" : "light"} style={styles.socialBlur}>
                      <AntDesign name="apple1" size={24} color={colors.text} />
                    </BlurView>
                  </AnimatedTouchable>
                )}

                <AnimatedTouchable 
                  style={[styles.socialButton, animatedTwitterStyle]}
                  onPress={handleTwitterSignIn}
                  disabled={isLoading}
                >
                  <BlurView intensity={40} tint={isDarkMode ? "dark" : "light"} style={styles.socialBlur}>
                    <AntDesign name="twitter" size={24} color="#1DA1F2" />
                  </BlurView>
                </AnimatedTouchable>
              </View>
            </View>
          </BlurView>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },
  tagline: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginTop: 16,
  },
  authContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  authCard: {
    borderRadius: 24,
  },
  authContent: {
    padding: 32,
    borderWidth: 1,
    borderRadius: 24,
  },
  authTitle: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  methodToggle: {
    flexDirection: 'row',
    marginBottom: 24,
    borderRadius: 12,
    padding: 4,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  methodText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    marginLeft: 12,
  },
  authButton: {
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  authGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  authButtonText: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  toggleButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginHorizontal: 16,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
  },
  socialBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
});