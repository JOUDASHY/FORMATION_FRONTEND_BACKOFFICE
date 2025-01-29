import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  optimizeDeps: {
    include: ['simple-peer', 'socket.io-client'],
  },
  plugins: [react()],
  define: {
    global: {},
  },
  base: '/', // Chemin racine de votre application. Changez-le si vous déployez dans un sous-dossier.
  server: {
    host: '0.0.0.0',  // Écoute sur toutes les interfaces réseau
    port: 5173,        // Ou un autre port de votre choix
    open: true,        // Ouvre automatiquement le navigateur (optionnel)
  },
  build: {
    outDir: 'dist', // Le répertoire de sortie pour le build
  }
});
