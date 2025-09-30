import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { VitePWA } from 'vite-plugin-pwa';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: "./",
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: {
        name: 'Catch the lion',
        short_name: 'Catch the lion',
        start_url: '/catch-the-lion/',
        scope: '/catch-the-lion/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0000ff'
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,webm,webp}']
      }
    }),
    tailwindcss(),
  ],
  worker: {
  },
  build: {
    target: 'esnext',
  },
  server: {
    port: 3000,
  },
});
