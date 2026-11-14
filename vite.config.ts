import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Luma New Tab is a single-page extension: `index.html` is both the Vite entry
 * and the page the manifest registers as the browser's new-tab override.
 *
 * `npm run build` emits a self-contained `dist/` folder that can be loaded
 * unpacked in Opera, Chrome or Edge.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Chromium-only product: no need to downlevel for older/other engines.
    target: 'chrome110',
  },
});
