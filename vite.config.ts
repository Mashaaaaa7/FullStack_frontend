import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    test: {
        exclude: [
            '**/node_modules/**',
            '**/init.test.tsx',
        ],
        environment: 'jsdom',
        globals: true,
        setupFiles: ['./src/setupTests.ts'],
    },
    server: {
        port: 3000,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true,
            },
        },
    },
});