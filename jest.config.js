module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'server.js',
    'ChatServer.js',
    'public/script.js',
    'tests/clientHelpers.js',
    '!node_modules/**',
    '!coverage/**',
    '!tests/setup.js'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000,
  roots: ['<rootDir>/tests'],
  verbose: true,
  collectCoverage: false, // จะเปิดเฉพาะเมื่อรัน --coverage
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/coverage/',
    '/tests/.*\\.old\\.js$'
  ]
};
