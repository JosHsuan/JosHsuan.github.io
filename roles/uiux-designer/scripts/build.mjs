import { createRequire } from 'node:module';
import { mkdir, copyFile, cp, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const role = fileURLToPath(new URL('../', import.meta.url));
const project = path.resolve(role, '../..');
const { webpack } = createRequire(path.join(project, 'package.json'))('next/dist/compiled/webpack/webpack');
const out = path.join(role, 'dist');
await mkdir(out, { recursive: true });
const catalog = JSON.parse(await readFile(path.join(role, 'catalog/materials.json'), 'utf8'));
await Promise.all(['assets', 'licenses', 'catalog'].map(directory => cp(path.join(role, directory), path.join(out, directory), { recursive: true })));
await Promise.all(['index.html', 'gallery.css', 'gallery.js', 'specimen.html', 'specimen.css', 'feedback.css', 'applied.css'].map(file => copyFile(path.join(role, 'preview', file), path.join(out, file))));
await cp(path.join(role, 'preview/features'), path.join(out, 'features'), { recursive: true });
await cp(path.join(role, 'src'), path.join(out, 'samples/src'), { recursive: true, filter: source => path.basename(source) !== 'authoring.js' });
await mkdir(path.join(out, 'samples/preview'), { recursive: true });
await copyFile(path.join(role, 'preview/feedback.css'), path.join(out, 'samples/preview/feedback.css'));
await copyFile(path.join(role, 'preview/applied.css'), path.join(out, 'samples/preview/applied.css'));
await new Promise((resolve, reject) => webpack({
  mode: 'production', target: 'web', devtool: false,
  optimization: { minimize: false },
  entry: { specimen: path.join(role, 'src/specimen.js'), features: path.join(role, 'src/feature-system/features.js') },
  output: { path: out, filename: '[name].js', chunkFilename: 'chunks/[name].[contenthash:8].js', clean: false, publicPath: '/' },
  resolve: { extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'], alias: { '@': path.join(project, 'src') }, modules: [path.join(role, 'node_modules'), path.join(project, 'node_modules'), 'node_modules'] },
  module: { rules: [{ test: /\.[jt]sx?$/, exclude: /node_modules/, use: path.join(role, 'scripts/ts-loader.cjs') }] },
  plugins: [{ apply(compiler) { compiler.hooks.compilation.tap('UIUXRuntime', compilation => { compilation.hooks.finishModules.tap('UIUXRuntime', modules => { for (const compiledModule of modules) if (/@theatre[+/]studio|authoring\./.test(compiledModule.identifier().replaceAll('\\', '/'))) throw new Error('Studio/authoring entered the proposal runtime bundle'); }); }); } }],
}, (error, stats) => error || stats.hasErrors() ? reject(error ?? new Error(stats.toString({ all: false, errors: true }))) : resolve()));
console.log(`Built ${catalog.materials.length} isolated specimens at ${out}`);
