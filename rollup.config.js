// rollup.config.js
import path from 'path';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import alias from '@rollup/plugin-alias';

const isProduction = process.env.NODE_ENV === 'production';

export default {
  input: 'src/main.js',
  output: [
    // Build para navegadores y bundlers modernos
    {
      file: 'dist/bundle.esm.js',
      format: 'es',
      sourcemap: !isProduction,
    },
    // Build para Node.js y bundlers antiguos
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
    resolve(),
    postcss({
      extract: 'style.css', // Extrae el CSS a dist/style.css
      minimize: isProduction, // Minimiza el CSS en producción
    }),
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx'],
      presets: [['@babel/preset-react', { pragma: 'h' }]],
    }),

    // Plugins solo para desarrollo
    !isProduction && serve('dist'),
    !isProduction && livereload('dist'),

    // Plugin solo para producción
    isProduction && terser(),
  ],
};
