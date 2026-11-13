import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The dashboard is a single HTML entry point shared by the dev server and the
// packaged extension. `base: './'` keeps asset URLs relative so the built
// `dist/` folder can be loaded directly as an unpacked Manifest V3 extension.
export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'chrome102',
  },
});
