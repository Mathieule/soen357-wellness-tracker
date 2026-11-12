import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';

const pkg = (p: string) => fileURLToPath(new URL(`../../packages/${p}/src`, import.meta.url));

// Relative base: the build can be opened from any folder or static host.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@ds': pkg('design-system'), '@core': pkg('core'), '@screens': pkg('screens') },
    dedupe: ['react', 'react-dom'],
  },
  server: { port: 5173 },
  preview: { port: 4173 },
});
