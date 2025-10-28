import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
      buffer: 'buffer/',
    },
  },
  server: {
    proxy: {
      '/api/v2/scan': {
        target: 'https://polkadot.api.subscan.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v2\/scan/, '/api/v2/scan'),
      },
      '/api/v1': {
        target: 'https://polkadot.polkassembly.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
    },
  },
})
