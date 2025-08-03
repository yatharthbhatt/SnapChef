import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    border: string;
    cardBackground: string;
    inputBackground: string;
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const lightColors = {
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1e293b',
  textSecondary: '#64748b',
  primary: '#10b981',
  border: '#e2e8f0',
  cardBackground: '#ffffff',
  inputBackground: '#f1f5f9',
};

const darkColors = {
  background: '#0a0a0b',
  surface: '#1a1a2e',
  text: '#ffffff',
  textSecondary: '#94a3b8',
  primary: '#10b981',
  border: 'rgba(255, 255, 255, 0.1)',
  cardBackground: 'rgba(255, 255, 255, 0.05)',
  inputBackground: 'rgba(255, 255, 255, 0.05)',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, colors }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} backgroundColor={colors.background} />
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}