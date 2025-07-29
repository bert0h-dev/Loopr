// rollup.config.js
import path from 'path';
import { fileURLToPath } from 'url';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import postcssImport from 'postcss-import';
import copy from 'rollup-plugin-copy';
import alias from '@rollup/plugin-alias';
import { visualizer } from 'rollup-plugin-visualizer';

// Fix para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: [
    {
      dir: 'dist/esm',
      format: 'es',
      sourcemap: !isProduction,
      entryFileNames: 'bundle.esm.js',
      chunkFileNames: '[name]-[hash].js',
    },
    {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: !isProduction,
      exports: 'auto',
      entryFileNames: 'bundle.cjs.js',
      chunkFileNames: '[name]-[hash].js',
    },
  ],
  external: isProduction ? ['preact', 'preact/hooks', 'preact/compat'] : [],
  plugins: [
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
      dedupe: ['preact'],
    }),
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist/esm' },
        { src: 'src/index.html', dest: 'dist/cjs' },
      ],
    }),
    postcss({
      plugins: [postcssImport()],
      extract: 'style.css',
      minimize: isProduction,
      sourceMap: !isProduction,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: [['@babel/preset-react', { pragma: 'h' }]],
    }),

    // Plugins solo para desarrollo
    !isProduction &&
      serve({
        contentBase: 'dist/esm',
        port: 3000,
        host: 'localhost',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }),
    !isProduction && livereload('dist/esm'),

    // Plugin solo para producción
    isProduction &&
      terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
        mangle: {
          reserved: ['h', 'render'],
        },
      }),

    // Bundle analyzer
    isProduction &&
      visualizer({
        filename: 'dist/bundle-stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
};
