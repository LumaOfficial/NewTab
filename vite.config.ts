import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Luma New Tab is a single-page extension: `index.html` is both the Vite entry
 * and the page the manifest registers as the browser's new-tab override.
 *
 * `npm run build` emits a self-contained `dist/` folder that can be loaded
 * unpacked in Opera, Chrome or Edge.
 *
 * During development the account service is reached through `/api` on the same
 * origin, so the browser sends its session cookie without any CORS dance. Set
 * `LUMA_API_PROXY_TARGET` when the API does not run on localhost:8000.
 */
const env = (
  globalThis as { process?: { env?: Record<string, string | undefined> } }
).process?.env ?? {};

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: env.LUMA_API_PROXY_TARGET || 'http://localhost:8000',
      },
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // Chromium-only product: no need to downlevel for older/other engines.
    target: 'chrome110',
  },
});
