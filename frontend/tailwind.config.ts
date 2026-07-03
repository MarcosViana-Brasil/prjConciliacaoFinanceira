import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#17202A',
        surface: '#F7F8FA',
        accent: '#0F766E'
      }
    }
  },
  plugins: []
};

export default config;

