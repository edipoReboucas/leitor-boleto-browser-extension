import * as esbuild from 'esbuild';
import { cpSync, mkdirSync, readFileSync, rmSync } from 'node:fs';

const watch = process.argv.includes('--watch');
const isProd = !watch;

function copyAssets() {
  rmSync('dist', { recursive: true, force: true });
  mkdirSync('dist/icons', { recursive: true });
  cpSync('manifest.json', 'dist/manifest.json');
  cpSync('public/icons', 'dist/icons', { recursive: true });
  cpSync('public/file-access.html', 'dist/file-access.html');
  cpSync('public/file-access.js', 'dist/file-access.js');
}

const buildOptions = {
  entryPoints: {
    background: 'src/background/index.js',
    content: 'src/content/index.js',
  },
  bundle: true,
  outdir: 'dist',
  format: 'iife',
  target: 'chrome115',
  loader: { '.css': 'text' },
  logLevel: 'info',
  define: {
    __LB_DEBUG__: isProd ? 'false' : 'true',
  },
  minify: isProd,
  plugins: [
    {
      name: 'jimp-stub',
      setup(build) {
        build.onResolve({ filter: /^jimp$/ }, () => ({
          path: 'jimp-stub',
          namespace: 'jimp-stub-ns',
        }));
        build.onLoad({ filter: /.*/, namespace: 'jimp-stub-ns' }, () => ({
          contents: 'module.exports = undefined;',
          loader: 'js',
        }));
      },
    },
    {
      name: 'umd-global-export',
      setup(build) {
        build.onLoad({ filter: /javascript-barcode-reader\.umd\.min\.js$/ }, (args) => ({
          contents: `${readFileSync(args.path, 'utf8')}\nexport default javascriptBarcodeReader;`,
          loader: 'js',
        }));
      },
    },
    {
      name: 'moment-stub',
      setup(build) {
        build.onResolve({ filter: /^moment-timezone$/ }, () => ({
          path: 'moment-stub',
          namespace: 'moment-stub-ns',
        }));
        build.onLoad({ filter: /.*/, namespace: 'moment-stub-ns' }, () => ({
          contents: `
            module.exports = {
              tz() {
                return { add() { return this; }, toDate() { return new Date(); } };
              }
            };
          `,
          loader: 'js',
        }));
      },
    },
  ],
};

if (watch) {
  copyAssets();
  const ctx = await esbuild.context(buildOptions);
  await ctx.watch();
  console.log('Watching for changes...');
} else {
  copyAssets();
  await esbuild.build(buildOptions);
}
