import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Absolute imports — avoids ../../../../ hell
      '@': `${import.meta.dirname}/src`,
      '@features': `${import.meta.dirname}/src/features`,
      '@shared': `${import.meta.dirname}/src/shared`,
      '@store': `${import.meta.dirname}/src/store`,
      '@lib': `${import.meta.dirname}/src/lib`,
      '@hooks': `${import.meta.dirname}/src/hooks`,
      '@utils': `${import.meta.dirname}/src/utils`,
      '@constants': `${import.meta.dirname}/src/constants`,
      '@assets': `${import.meta.dirname}/src/assets`,
      '@styles': `${import.meta.dirname}/src/styles`,
    },
  },
  server: {
    port: 5173,
    proxy: {
      // Proxy API requests to backend during development
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // disable in production for security
    rollupOptions: {
      output: {
        // Manual chunk splitting for performance
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) return 'vendor';
          if (id.includes('node_modules/react-router-dom')) return 'router';
          if (id.includes('node_modules/@reduxjs') || id.includes('node_modules/react-redux')) return 'redux';
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/zod')) return 'forms';
          if (id.includes('node_modules/@fullcalendar')) return 'calendar';
          if (id.includes('node_modules/swiper')) return 'swiper';
        },
      },
    },
  },
});
