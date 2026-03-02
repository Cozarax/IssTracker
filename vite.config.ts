import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

export default defineConfig({
  plugins: [react(), tailwindcss(), glsl()],

  optimizeDeps: {
    include: [
      'three',
      'three-globe',
      '@react-three/fiber',
      '@react-three/drei',
      '@react-three/postprocessing',
      'lil-gui',
    ],
  },

  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three-globe/')) return 'vendor-three-globe';
          if (id.includes('node_modules/three/'))       return 'vendor-three';
          if (id.includes('node_modules/@react-three/')) return 'vendor-r3f';
        },
      },
    },
  },
});
