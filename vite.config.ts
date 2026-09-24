/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tanstackRouter({ target: 'react', autoCodeSplitting: true }), react(), tailwindcss()],
  test: {
    projects: [
      {
        // Plain functions (validation rules, form logic): no browser needed.
        extends: true,
        test: { name: 'unit', environment: 'node', include: ['{src,shared}/**/*.test.ts'] },
      },
      {
        // React components: jsdom gives them a fake browser page to render into.
        extends: true,
        test: {
          name: 'component',
          environment: 'jsdom',
          include: ['src/**/*.test.tsx'],
          setupFiles: ['./src/test/setup.ts'],
        },
      },
    ],
  },
})
