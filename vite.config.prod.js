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
    target: 'es2020',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          audio: ['tone']
        }
      }
    },
    terserOptions: {
      compress: {
        drop_console: false, // Keep console.log for debugging
        drop_debugger: true
      }
    },
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    chunkSizeWarningLimit: 1000 // Warn for chunks larger than 1MB
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['three', 'gsap', 'tone']
  },
  define: {
    __DEV__: false
  }
})