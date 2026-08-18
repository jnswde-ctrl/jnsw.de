import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  stories: ["../app/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-docs",
    "@storybook/addon-mcp",
    "msw-storybook-addon",
  ],
  framework: "@storybook/nextjs-vite",
  staticDirs: ["../public"],
  core: {
    builder: {
      name: "@storybook/builder-vite",
      options: {
        // vinext's RSC build plugins are for the application build, not the
        // isolated component renderer used by Storybook.
        viteConfigPath: ".storybook/vite.config.ts",
      },
    },
  },
};
export default config;
