import { defineConfig, type Plugin, type ResolvedConfig } from 'vite';
import { copyFileSync } from 'node:fs';
import { resolve } from 'node:path';
import common from './vite.config-common';

/** Keep the upstream IDE entry intact; only this app's server uses the visualizer as its homepage. */
const homepage: Plugin = {
  name: 'visualizer-homepage',
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      const url = new URL(request.url ?? '/', 'http://localhost');
      if (url.pathname === '/' || url.pathname === '/index.html') request.url = `/visualizer.html${url.search}`;
      next();
    });
  },
};
let config: ResolvedConfig;
const staticHomepage: Plugin = {
  name: 'visualizer-static-homepage',
  apply: 'build',
  configResolved(resolved) { config = resolved; },
  closeBundle() {
    const output = resolve(config.root, config.build.outDir);
    copyFileSync(resolve(output, 'visualizer.html'), resolve(output, 'index.html'));
  },
};

export default defineConfig({
  ...common,
  base: './',
  plugins: [homepage, staticHomepage],
  build: { ...common.build, sourcemap: false, minify: false, outDir: 'dist-visualizer', rollupOptions: { input: 'visualizer.html' } },
});
