
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    resolve: {
      alias: [{ find: '@', replacement: '/src' }],
    },
    test: {
      environment: 'jsdom',
      globals: true, // Ensure this is set
      setupFiles: './src/setupTests.js',
    },
    define: {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process': {env: {}}
    },
    server: {
      port: parseInt(env.VITE_DEV_PORT) || 3000, // Use the env port or default to 3000
    },
  };
});






