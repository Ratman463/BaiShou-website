import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

// GitHub Pages + 自定义域名 baishou.foxletters.com
// https://docs.astro.build/en/guides/deploy/github/
export default defineConfig({
  site: 'https://baishou.foxletters.com',
  base: '/',
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  output: 'static',
  server: {
    host: true,
    port: 4321,
  },
  preview: {
    host: true,
    port: 4321,
  },
});