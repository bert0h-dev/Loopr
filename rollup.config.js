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
import replace from '@rollup/plugin-replace';
import json from '@rollup/plugin-json';
import url from '@rollup/plugin-url';
import image from '@rollup/plugin-image';
import { visualizer } from 'rollup-plugin-visualizer';
import { config } from 'dotenv';

// Importaciones PostCSS
import postcssCustomProperties from 'postcss-custom-properties';
import postcssNested from 'postcss-nested';
import postcssMixins from 'postcss-mixins';
import postcssUtilities from 'postcss-utilities';
import postcssPresetEnv from 'postcss-preset-env';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';

// Fix para ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
config({ path: '.env.local' }); // Cargar .env.local primero
config({ path: '.env.example' }); // Fallback a .env.example

const isProduction = process.env.NODE_ENV === 'production';

// Configuración de alias avanzada
const aliasConfig = {
  entries: [
    // Alias principal del proyecto
    { find: '@', replacement: path.resolve(__dirname, 'src') },

    // Alias específicos para organización
    {
      find: '@/components',
      replacement: path.resolve(__dirname, 'src/components'),
    },
    { find: '@/utils', replacement: path.resolve(__dirname, 'src/utils') },
    { find: '@/context', replacement: path.resolve(__dirname, 'src/context') },
    { find: '@/hooks', replacement: path.resolve(__dirname, 'src/hooks') },
    { find: '@/types', replacement: path.resolve(__dirname, 'src/types') },
    { find: '@/styles', replacement: path.resolve(__dirname, 'src/css') },
    { find: '@/assets', replacement: path.resolve(__dirname, 'src/assets') },
    {
      find: '@/constants',
      replacement: path.resolve(__dirname, 'src/constants'),
    },

    // Alias para librerías comunes
    { find: 'react', replacement: 'preact/compat' },
    { find: 'react-dom', replacement: 'preact/compat' },
    { find: 'react/jsx-runtime', replacement: 'preact/jsx-runtime' },
  ],
};

// Configuración de resolución de módulos
const resolveConfig = {
  browser: true,
  preferBuiltins: false,

  // Extensiones soportadas (en orden de prioridad)
  extensions: [
    '.mjs', // ES modules
    '.js', // JavaScript
    '.jsx', // JSX
    '.ts', // TypeScript
    '.tsx', // TypeScript JSX
    '.json', // JSON files
    '.css', // CSS files
    '.scss', // SCSS files
    '.sass', // SASS files
    '.less', // LESS files
    '.styl', // Stylus files
  ],

  // Directorios de resolución
  moduleDirectories: ['node_modules', 'src'],

  // Deduplicación de paquetes
  dedupe: ['preact', 'preact/hooks', 'preact/compat', 'date-fns'],

  // Condiciones de export para mejor compatibilidad
  exportConditions: ['browser', 'import', 'module', 'default'],

  // Campos de package.json a considerar
  mainFields: ['browser', 'module', 'jsnext:main', 'main'],

  // Alias adicionales a nivel de resolve
  alias: {
    // React compatibility
    react: 'preact/compat',
    'react-dom': 'preact/compat',
    'react-dom/server': 'preact/compat',
    'react/jsx-runtime': 'preact/jsx-runtime',
    'react/jsx-dev-runtime': 'preact/jsx-dev-runtime',

    // Common aliases
    '~': path.resolve(__dirname, 'src'),
    src: path.resolve(__dirname, 'src'),
  },
};

// Variables de entorno con valores por defecto
const envVars = {
  'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  'process.env.VITE_API_URL': JSON.stringify(
    process.env.VITE_API_URL || 'http://localhost:3001'
  ),
  'process.env.VITE_API_TIMEOUT': JSON.stringify(
    process.env.VITE_API_TIMEOUT || '5000'
  ),
  'process.env.VITE_APP_NAME': JSON.stringify(
    process.env.VITE_APP_NAME || 'Loopr'
  ),
  'process.env.VITE_APP_VERSION': JSON.stringify(
    process.env.VITE_APP_VERSION || '1.0.3'
  ),
  'process.env.VITE_APP_DEBUG': JSON.stringify(
    process.env.VITE_APP_DEBUG === 'true'
  ),
  'process.env.VITE_DEFAULT_VIEW': JSON.stringify(
    process.env.VITE_DEFAULT_VIEW || 'month'
  ),
  'process.env.VITE_ENABLE_TIME_SLOTS': JSON.stringify(
    process.env.VITE_ENABLE_TIME_SLOTS === 'true'
  ),
  'process.env.VITE_MAX_EVENTS_PER_DAY': JSON.stringify(
    process.env.VITE_MAX_EVENTS_PER_DAY || '10'
  ),
  'process.env.VITE_ENABLE_ANALYTICS': JSON.stringify(
    process.env.VITE_ENABLE_ANALYTICS === 'true'
  ),
  'process.env.VITE_ENABLE_NOTIFICATIONS': JSON.stringify(
    process.env.VITE_ENABLE_NOTIFICATIONS === 'true'
  ),
  'process.env.VITE_ENABLE_THEMES': JSON.stringify(
    process.env.VITE_ENABLE_THEMES === 'true'
  ),
};

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
    // Plugin para variables de entorno
    replace({
      ...envVars,
      preventAssignment: true,
    }),

    // Plugin de alias mejorado
    alias(aliasConfig),

    // Plugin para importar archivos JSON
    json({
      compact: isProduction,
      namedExports: true,
      preferConst: true,
    }),

    // Plugin para manejar URLs de assets
    url({
      limit: 8192, // 8kb - archivos menores se convierten en base64
      include: [
        '**/*.svg',
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.gif',
        '**/*.webp',
        '**/*.avif',
        '**/*.woff',
        '**/*.woff2',
        '**/*.ttf',
        '**/*.eot',
      ],
      fileName: 'assets/[name][extname]',
      publicPath: './',
    }),

    // Plugin para importar imágenes
    image({
      include: [
        '**/*.png',
        '**/*.jpg',
        '**/*.jpeg',
        '**/*.gif',
        '**/*.svg',
        '**/*.webp',
      ],
      exclude: ['node_modules/**'],
    }),

    // Plugin de resolución mejorado
    resolve(resolveConfig),

    // Plugin para copiar archivos estáticos
    copy({
      targets: [
        { src: 'src/index.html', dest: 'dist/esm' },
        { src: 'src/index.html', dest: 'dist/cjs' },
        // Copiar favicon si existe
        { src: 'src/favicon.ico', dest: 'dist/esm', rename: 'favicon.ico' },
        { src: 'src/favicon.ico', dest: 'dist/cjs', rename: 'favicon.ico' },
      ],
      // Solo copiar si el archivo existe
      copyOnce: true,
      flatten: false,
      verbose: !isProduction,
    }),

    // Plugin PostCSS optimizado
    postcss({
      plugins: [
        // Importación de archivos CSS
        postcssImport({
          resolve: (id, basedir) => {
            // Resolver imports con alias
            if (id.startsWith('@/')) {
              return path.resolve(__dirname, 'src', id.slice(2));
            }
            if (id.startsWith('~')) {
              return path.resolve(__dirname, 'src', id.slice(1));
            }
            // Retornar el id original para que postcss-import lo maneje
            return id;
          },
        }),

        // Permitir reglas CSS anidadas
        postcssNested(),

        // Características CSS modernas con fallbacks
        postcssPresetEnv({
          stage: 1, // Usar características CSS más modernas
          features: {
            'nesting-rules': false, // Ya manejado por postcss-nested
            'custom-media-queries': true,
            'media-query-ranges': true,
            'custom-selectors': true,
          },
          autoprefixer: {
            grid: true, // Soporte para CSS Grid con prefijos
            flexbox: true,
          },
          browsers: 'last 2 versions, > 1%, not dead',
        }),

        // Autoprefixer para compatibilidad cross-browser
        autoprefixer({
          grid: 'autoplace',
          flexbox: true,
          overrideBrowserslist: [
            'last 2 versions',
            '> 1%',
            'not dead',
            'not ie 11',
          ],
        }),

        // Minificación CSS en producción
        ...(isProduction
          ? [
              cssnano({
                preset: [
                  'default',
                  {
                    discardComments: { removeAll: true },
                    autoprefixer: false, // Ya aplicado arriba
                    normalizeWhitespace: true,
                    mergeLonghand: true,
                    mergeRules: true,
                    minifySelectors: true,
                    reduceIdents: false, // Mantener nombres de variables CSS
                    calc: true,
                    colormin: true,
                    convertValues: true,
                    discardDuplicates: true,
                    discardEmpty: true,
                    discardOverridden: true,
                    normalizeCharset: true,
                    normalizeUrl: true,
                    uniqueSelectors: true,
                  },
                ],
              }),
            ]
          : []),
      ],

      extract: 'style.css',
      minimize: false, // Manejado por cssnano si está en producción
      sourceMap: !isProduction,

      // Configuración de inyección CSS
      inject: !isProduction
        ? {
            insertAt: 'top',
            attributes: { 'data-source': 'loopr-styles' },
          }
        : false,

      // Configuración avanzada
      use: [
        [
          'sass',
          {
            includePaths: [
              path.resolve(__dirname, 'src/css'),
              path.resolve(__dirname, 'node_modules'),
            ],
          },
        ],
      ],
    }),
    // Plugin Babel mejorado
    babel({
      babelHelpers: 'bundled',
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      exclude: 'node_modules/**',
      presets: [
        [
          '@babel/preset-react',
          {
            pragma: 'h',
            pragmaFrag: 'Fragment',
            runtime: 'classic',
          },
        ],
      ],
      // Configuración específica por entorno
      ...(isProduction && {
        compact: true,
        minified: true,
      }),
    }),

    // Plugins solo para desarrollo
    !isProduction &&
      serve({
        contentBase: 'dist/esm',
        port: process.env.VITE_DEV_PORT || 3000,
        host: process.env.VITE_DEV_HOST || 'localhost',
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
      process.env.VITE_BUILD_ANALYZE === 'true' &&
      visualizer({
        filename: 'dist/bundle-stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
        title: 'Loopr Bundle Analysis',
        template: 'treemap',
      }),
  ].filter(Boolean),
};
