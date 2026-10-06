import type { NextConfig } from 'next';
import { validateBasePath } from './src/lib/paths';

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  basePath: validateBasePath(process.env.NEXT_PUBLIC_BASE_PATH ?? ''),
  images: { unoptimized: true },
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  webpack(config, { dev }) {
    if (!dev) {
      config.plugins.push({
        // Fail on imported authoring modules, even if an editor is hidden in the UI.
        apply(compiler: import('next/dist/compiled/webpack/webpack').webpack.Compiler) {
          compiler.hooks.compilation.tap('PublicBoundary', (compilation: import('next/dist/compiled/webpack/webpack').webpack.Compilation) => {
            compilation.hooks.finishModules.tap('PublicBoundary', (modules: Iterable<{ identifier(): string }>) => {
              for (const compiledModule of modules) {
                const id = compiledModule.identifier().replaceAll('\\', '/');
                if (/@theatre[+/]studio|\/src\/dev\/|studio\.dev/.test(id)) {
                  throw new Error(`Authoring module in production: ${id}`);
                }
              }
            });
          });
        },
      });
    }
    return config;
  },
};

export default nextConfig;
