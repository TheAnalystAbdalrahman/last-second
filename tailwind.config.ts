import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f4f0',
        paper: '#ffffff',
        ink: '#000000',
        graphite: '#242423',
        hairline: '#d1d5dc',
        pink: '#ff90e8',
        yellow: '#ffc900',
        lime: '#f1f333',
        vermillion: '#dc341e',
      },
      borderRadius: {
        card: '16px',
        tile: '24px',
        input: '4px',
        btn: '4px',
        pill: '9999px',
      },
      fontFamily: {
        primary: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}

export default config
