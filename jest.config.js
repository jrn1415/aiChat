module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'server.js',
    'ChatServer.js',
    'public/script.js',
    '!node_modules/**',
    '!coverage/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  roots: ['<rootDir>/tests'],
  verbose: true
};
