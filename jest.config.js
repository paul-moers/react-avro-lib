module.exports = {
  collectCoverageFrom: [
    'src/**/*utils.{ts,tsx}', // Unit testing only for utils files.
  ],
  coveragePathIgnorePatterns: ['/node_modules/', 'index.ts'],
  globals: {
    crypto: require('crypto'),
  },
  moduleNameMapper: {
    'src/(.*)': '<rootDir>/src/$1',
    'tests/(.*)': '<rootDir>/tests/$1',
  },
  testEnvironment: 'jsdom',
  testMatch: [
    '<rootDir>/tests/jest/**/*utils.test.{ts,tsx}', // Unit testing only for utils files.
  ],
  testPathIgnorePatterns: ['<rootDir>/tests/cypress/'],
};
