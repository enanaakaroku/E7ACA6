import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      textShadow: {
        'white-sm': '1px 1px 2px rgba(255, 255, 255, 0.8)',
        'white-md': '2px 2px 4px rgba(255, 255, 255, 0.8)',
        'white-lg': '3px 3px 6px rgba(255, 255, 255, 0.8)',
      }
    },
  },
  plugins: [],
};
export default config;
