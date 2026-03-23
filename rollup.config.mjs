import commonjs from '@rollup/plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

const PLUGIN_DIR = 'com.alex.market-monitor.sdPlugin';

export default {
  input: 'src/plugin.ts',
  output: {
    file: `${PLUGIN_DIR}/bin/plugin.js`,
    format: 'cjs',
    sourcemap: true,
    exports: 'auto',
  },
  plugins: [
    nodeResolve({ preferBuiltins: true }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
  ],
  external: [
    'child_process', 'events', 'net', 'path', 'os',
    'stream', 'util', 'fs', 'url', 'http', 'https', 'crypto',
  ],
};
