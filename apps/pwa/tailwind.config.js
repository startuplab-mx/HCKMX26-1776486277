/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        card: "0 10px 30px -18px rgba(15, 23, 42, 0.45), 0 2px 10px -6px rgba(15, 23, 42, 0.18)",
      },
      colors: {
        // Semantic tokens (shadcn-style) backed by CSS variables in `src/index.css`.
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        border: "hsl(var(--border))",
        ring: "hsl(var(--ring))",
        info: "hsl(var(--info))",
        warn: "hsl(var(--warning))",
        safe: "hsl(var(--safe))",
        "safe-foreground": "hsl(var(--safe-foreground))",
        "safe-subtle": "hsl(var(--safe-subtle))",
        "safe-border": "hsl(var(--safe-border))",
        "primary-subtle": "hsl(var(--primary-subtle))",
        "warn-foreground": "hsl(var(--warn-foreground))",
        "warn-subtle": "hsl(var(--warn-subtle))",
        "warn-border": "hsl(var(--warn-border))",
        kipi: {
          blue: '#32B4D1',
          aqua: '#32D2BA',
          green: '#32D285',
        },
        primary: {
          DEFAULT: '#32B4D1',
          light: '#32D2BA',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#32D285',
        }
      },
      fontFamily: {
        heading: ['"Bauhaus 93"', 'cursive', 'Arial', 'sans-serif'],
        sans: ['Arial', 'Helvetica', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

