import { defineConfig } from 'cypress';

const commonConfig = {
  downloadsFolder: 'tests/cypress/downloads',
  fixturesFolder: 'tests/cypress/fixtures',
  screenshotsFolder: 'tests/cypress/screenshots',
  supportFolder: 'tests/cypress/support',
  videosFolder: 'tests/cypress/videos',
  supportFile: 'tests/cypress/support/index.ts',
};

export default defineConfig({
  e2e: {
    ...commonConfig,
    baseUrl: 'http://localhost:6006',
    specPattern: 'tests/cypress/integration/*spec.{js,jsx,ts,tsx}',
  },
  component: {
    ...commonConfig,
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    indexHtmlFile: 'tests/cypress/support/component-index.html',
    specPattern: 'tests/cypress/components/*spec.{js,jsx,ts,tsx}',
  },
});
