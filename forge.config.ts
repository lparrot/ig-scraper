import type {ForgeConfig} from '@electron-forge/shared-types';
import {VitePlugin} from '@electron-forge/plugin-vite';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'extra/icons/icon.ico',
    extraResource: 'extra'
  },
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/electron/main.ts',
          config: 'vite.main.config.mts',
          target: 'main',
        },
        {
          entry: 'src/electron/preload.ts',
          config: 'vite.preload.config.mts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.mts',
        },
      ],
    }),
  ],
};

export default config;
