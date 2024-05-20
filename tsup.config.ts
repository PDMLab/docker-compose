import { defineConfig } from 'tsup'

export default defineConfig([
  {
    entry: ['src/index.ts', 'src/v2.ts'],
    splitting: true,
    sourcemap: true,
    format: ['esm'],
    outExtension: () => ({ js: '.mjs', dts: '.d.ts' }),
    outDir: 'dist/esm',
    clean: true,
    dts: true
  },
  {
    entry: ['src/index.ts', 'src/v2.ts'],
    splitting: true,
    sourcemap: true,
    format: ['cjs'],
    outExtension: () => ({ js: '.js', dts: '.d.ts' }),
    outDir: 'dist/cjs',
    clean: true,
    dts: true
  }
])
