/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Eternal Empire theme colors
                'eternal-black': '#1a1a2e',
                'eternal-gold': '#d4af37',
                'eternal-red': '#8b0000',
                'bg-primary': '#0f0f1e',
                'bg-secondary': '#1a1a2e',
                'bg-surface': '#2d2d44',
                'bg-elevated': '#3a3a52',
                'border-primary': '#4a4a66',
                'text-primary': '#e0e0e0',
                'text-secondary': '#a0a0b0',
                'text-disabled': '#6a6a7e',
            },
            fontFamily: {
                'serif': ['Cinzel', 'serif'],
                'sans': ['Inter', 'sans-serif'],
                'mono': ['JetBrains Mono', 'monospace'],
            },
        },
    },
    plugins: [],
}
