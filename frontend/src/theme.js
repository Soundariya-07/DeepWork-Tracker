import { extendTheme } from '@chakra-ui/react';

const colors = {
  brand: {
    50: '#e6f6ff',
    100: '#b3e0ff',
    200: '#80cbff',
    300: '#4db6ff',
    400: '#1aa1ff',
    500: '#0088e6',
    600: '#006bb3',
    700: '#004d80',
    800: '#1a1f2c',
    900: '#141821',
  },
  gray: {
    50: '#f7fafc',
    100: '#edf2f7',
    200: '#e2e8f0',
    300: '#cbd5e0',
    400: '#a0aec0',
    500: '#718096',
    600: '#4a5568',
    700: '#2d3748',
    800: '#1a202c',
    900: '#171923',
  },
  accent: {
    red: '#FF6B6B',
    green: '#06D6A0',
    yellow: '#FFD166',
    blue: '#118AB2',
    purple: '#9370DB',
    pink: '#FF69B4',
    orange: '#F78C6B',
    teal: '#4ECDC4',
  },
  background: {
    light: '#F8F9FA',
    dark: '#1A202C',
  },
};

const fonts = {
  body: "'Inter', sans-serif",
  heading: "'Inter', sans-serif",
};

const config = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const components = {
  Button: {
    baseStyle: {
      borderRadius: 'full',
      fontWeight: 'medium',
    },
    variants: {
      solid: (props) => ({
        bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: 'white',
        _hover: {
          bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.600',
        },
      }),
      outline: (props) => ({
        borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
        color: props.colorMode === 'dark' ? 'brand.500' : 'brand.500',
      }),
    },
  },
  Card: {
    baseStyle: (props) => ({
      container: {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
        borderRadius: 'lg',
        boxShadow: 'md',
        overflow: 'hidden',
      },
    }),
  },
};

const theme = extendTheme({ colors, fonts, config, components });

export default theme;
