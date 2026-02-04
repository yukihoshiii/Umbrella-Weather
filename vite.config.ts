import { defineConfig } from 'vite';

export default defineConfig({
    base: './',
    build: {
        outDir: 'dist',
        minify: true,
    },
    server: {
        port: 3000,
    }
});
