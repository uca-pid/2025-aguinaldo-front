/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src')
    }
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setup.ts',
    include: [
      'src/core/**/*.{test,spec}.{ts,tsx}',
      'src/hooks/**/*.{test,spec}.{ts,tsx}',
      'src/machines/**/*.{test,spec}.{ts,tsx}',
      'src/providers/**/*.{test,spec}.{ts,tsx}',
      'src/service/**/*.{test,spec}.{ts,tsx}',
      'src/utils/**/*.{test,spec}.{ts,tsx}',
      'src/App.{test,spec}.{ts,tsx}'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
})
