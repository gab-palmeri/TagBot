import { defineConfig } from 'tsup';
import { builtinModules } from 'module';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node20',
  clean: true,
  splitting: false,
  shims: true,
  platform: 'node',
  
  noExternal: [
    'grammy',
    '@grammyjs/auto-retry',
    '@grammyjs/commands',
    '@grammyjs/i18n',
    '@grammyjs/menu',
    '@grammyjs/ratelimiter',
    '@grammyjs/runner',
    'dayjs',
    'kysely',
    'pg',
    'reflect-metadata'
  ],

  external: [
    ...builtinModules,
    ...builtinModules.map((m) => `node:${m}`),
  ],

  banner: {
    js: `
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    `.trim(),
  },
});