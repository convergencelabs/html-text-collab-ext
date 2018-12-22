import typescript from 'rollup-plugin-typescript2'
import resolve from 'rollup-plugin-node-resolve';
import commonJS from 'rollup-plugin-commonjs'
import pkg from './package.json'

export default {
  input: 'src/ts/index.ts',
  output: {
    file: "dist/umd/html-text-collab-ext.js",
    format: 'umd',
    name: "HtmlTextCollabExt"

  },
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    resolve(),
    commonJS({
      include: 'node_modules/**'
    }),
    typescript({
      typescript: require('typescript'),
    }),
  ],
}