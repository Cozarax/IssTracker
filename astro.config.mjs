// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import glsl from 'vite-plugin-glsl';

// https://astro.build/config
export default defineConfig({
  integrations: [react()],

  vite: {
    plugins: [tailwindcss(), glsl()],
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
            if (id.includes('node_modules/three/')) return 'vendor-three';
            if (id.includes('node_modules/@react-three/')) return 'vendor-r3f';
          },
        },
      },
    },
  }
});