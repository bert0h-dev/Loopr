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

// Fix para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: [
    {
      file: 'dist/bundle.esm.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    {
      file: 'dist/bundle.cjs.js',
      format: 'cjs',
      sourcemap: !isProduction,
    },
  ],
  plugins: [
    alias({
      entries: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
    }),
    resolve({
      browser: true,
      preferBuiltins: false,
    }),
    copy({
      targets: [{ src: 'src/index.html', dest: 'dist' }],
    }),
    postcss({
      plugins: [postcssImport()],
      extract: 'style.css',
      minimize: isProduction,
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: [['@babel/preset-react', { pragma: 'h' }]],
    }),

    // Plugins solo para desarrollo
    !isProduction &&
      serve({
        contentBase: 'dist',
        port: 3000,
        host: 'localhost',
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }),
    !isProduction && livereload('dist'),

    // Plugin solo para producción
    isProduction && terser(),
  ],
};
