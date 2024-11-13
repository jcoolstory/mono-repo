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
        gravity: resolve(__dirname, '/gravity/index.html'),
        raytracing: resolve(__dirname, '/raytracing/index.html'),
        raytracingConvex: resolve(__dirname, '/raytracingConvex/index.html'),
        sprite: resolve(__dirname, '/sprite/index.html'),

      },
    },
  },
})