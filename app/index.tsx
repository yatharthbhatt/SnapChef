import { useEffect, useState, useRef } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/components/AuthProvider';
import { View, ActivityIndicator } from 'react-native';
import { useTheme } from '@/components/ThemeProvider';

export default function Index() {
  const { user, isLoading } = useAuth();
  const { colors } = useTheme();
  const [hasNavigated, setHasNavigated] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!isLoading && !hasNavigated && isMounted.current) {
      setHasNavigated(true);
      
      const timer = setTimeout(() => {
        if (isMounted.current) {
          try {
            if (user) {
              router.replace('/(tabs)/scanner');
            } else {
              router.replace('/(auth)/login');
            }
          } catch (error) {
            console.log('Navigation error:', error);
          }
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [user, isLoading, hasNavigated]);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.background 
    }}>
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}