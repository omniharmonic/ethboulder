import { defineConfig } from 'vite'
import { resolve } from 'path'
import glsl from 'vite-plugin-glsl'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    glsl(),
    legacy({
      targets: ['defaults', 'not IE 11']
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          audio: ['tone']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'tone']
  }
})