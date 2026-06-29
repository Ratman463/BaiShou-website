import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// GitHub Pages: 仓库名为 Ratman463.github.io，用户/组织站点根路径部署
// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
  site: 'https://ratman463.github.io',
  base: '/',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static',
});