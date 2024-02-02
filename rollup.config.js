import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

export default {
  input: 'src/index.js',
  output: {
    file: '../gdpr-production/src/backend/shared/yett.min.js',
    // file: './dist/yett.min.js',
    format: 'iife',
    name: 'yett',
    sourcemap: false,
  },
  plugins: [
    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
    terser(),
  ],
};
