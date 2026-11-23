import { defineConfig } from 'vite';

export default defineConfig({
  // reachable from the LAN for testing on a phone
  server: { host: true, port: 5180, strictPort: true },
});
