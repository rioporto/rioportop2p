import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores do Cofre/Banco
        "azul-cofre": "#1E3A5F",
        "prata-metal": "#C0C5CE",
        "dourado-real": "#FFD700",
        "verde-cedula": "#2E7D32",
        
        // Cores de Confiança
        "azul-bancario": "#0047AB",
        "cinza-seguro": "#434B5C",
        
        // Estados e Feedback
        "verde-confirmacao": "#4CAF50",
        "amarelo-atencao": "#FFC107",
        "vermelho-alerta": "#D32F2F",
        "azul-info": "#1976D2",
        
        // Cores base do projeto
        primary: "#0047AB",
        secondary: "#4CAF50",
        accent: "#FFD700",
        danger: "#D32F2F",
        background: "#f3f4f6",
        surface: "#ffffff",
        "text-primary": "#111827",
        "text-secondary": "#6b7280",
      },
      fontFamily: {
        primary: ['Roboto', 'Arial', 'sans-serif'],
        money: ['Roboto Mono', 'Courier New', 'monospace'],
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
      },
      fontSize: {
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      boxShadow: {
        'elevation-1': '0 2px 4px rgba(0,0,0,0.1)',
        'elevation-2': '0 4px 8px rgba(0,0,0,0.15)',
        'elevation-3': '0 8px 16px rgba(0,0,0,0.2)',
        'skeuo-button': '0 6px 12px rgba(0,0,0,0.3), 0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3), inset 0 -2px 0 rgba(0,0,0,0.2)',
        'skeuo-button-active': '0 2px 4px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)',
        'skeuo-metal': '4px 4px 8px #b3b8c1, -4px -4px 8px #ffffff, inset 1px 1px 2px rgba(255,255,255,0.7)',
        'skeuo-card': '0 10px 20px rgba(0,0,0,0.3), 0 6px 6px rgba(0,0,0,0.2)',
        'skeuo-input': 'inset 0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(192,197,206,0.3)',
        'skeuo-switch': 'inset 0 4px 8px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'skeuo-switch-knob': '0 4px 8px rgba(0,0,0,0.3), inset 0 -2px 4px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.8)',
        'skeuo-coin': '0 4px 8px rgba(0,0,0,0.3), inset -2px -2px 4px rgba(0,0,0,0.2), inset 2px 2px 4px rgba(255,255,255,0.5)',
      },
      animation: {
        'cofre-unlock': 'cofre-unlock 2s ease-in-out',
        'shine': 'shine 0.5s ease-in-out',
        'led-pulse': 'led-pulse 2s ease-in-out infinite',
        'button-press': 'button-press 0.1s ease',
      },
      keyframes: {
        'cofre-unlock': {
          '0%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-90deg)' },
          '50%': { transform: 'rotate(-180deg)' },
          '75%': { transform: 'rotate(-270deg)' },
          '100%': { transform: 'rotate(-360deg)' },
        },
        'shine': {
          '0%': { opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { 
            opacity: '0',
            transform: 'translateX(100%) rotate(45deg)',
          },
        },
        'led-pulse': {
          '0%': { boxShadow: '0 0 4px currentColor' },
          '50%': { boxShadow: '0 0 16px currentColor' },
          '100%': { boxShadow: '0 0 4px currentColor' },
        },
        'button-press': {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'metal-gradient': 'linear-gradient(145deg, #e6e9ef, #c0c5ce)',
        'cofre-gradient': 'linear-gradient(135deg, #1E3A5F 0%, #2B4C7E 100%)',
        'button-primary-gradient': 'linear-gradient(135deg, #0047AB 0%, #003380 100%)',
        'coin-gradient': 'radial-gradient(circle at 30% 30%, #FFD700, #B8860B)',
        'chip-gradient': 'linear-gradient(135deg, #FFD700, #FFA500)',
        'switch-gradient': 'linear-gradient(to bottom, #434B5C, #2B3340)',
        'switch-active-gradient': 'linear-gradient(135deg, #4CAF50, #45a049)',
      },
    },
  },
  plugins: [],
} satisfies Config;