import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { IconButton, MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';

export const ThemeContext = createContext<{
  isDark: boolean;
  toggleTheme: () => void;
}>({
  isDark: false,
  toggleTheme: () => {},
});

const customLightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#2196F3',
  },
};

const customDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#2196F3',
  },
};

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  return (
    <IconButton
      icon={isDark ? 'weather-sunny' : 'weather-night'}
      size={24}
      onPress={toggleTheme}
    />
  );
};

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemScheme === 'dark');

  useEffect(() => {
    AsyncStorage.getItem('@theme_mode').then((value) => {
      if (value === 'dark') setIsDark(true);
      else if (value === 'light') setIsDark(false);
    });
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    AsyncStorage.setItem('@theme_mode', newIsDark ? 'dark' : 'light');
  };

  const theme = isDark ? customDarkTheme : customLightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <PaperProvider theme={theme}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: 'Job Applications',
              headerRight: () => <ThemeToggle />,
            }}
          />
          <Stack.Screen
            name="form"
            options={{
              title: 'Application Details',
              headerRight: () => <ThemeToggle />,
            }}
          />
        </Stack>
      </PaperProvider>
    </ThemeContext.Provider>
  );
}