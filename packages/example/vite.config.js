import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  root:"./src",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        beamtracing: resolve(__dirname, '/beamtracing/index.html'),
        circletest: resolve(__dirname, '/circletest/index.html'),
      },
    },
  },
})