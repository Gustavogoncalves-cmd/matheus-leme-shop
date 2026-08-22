module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.{test,spec}.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/app.js',
    '!src/config/**',
    '!src/middleware/auth.js',
  ],
  coveragePathIgnorePatterns: ['/node_modules/'],
  testTimeout: 10000,
  verbose: true,
};
