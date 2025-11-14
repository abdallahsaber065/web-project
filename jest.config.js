/**
 * Jest configuration for automated testing
 */

module.exports = {
    testEnvironment: 'node',
    coveragePathIgnorePatterns: ['/node_modules/'],
    testMatch: ['**/tests/**/*.test.js'],
    verbose: true,
    testTimeout: 10000,
    collectCoverageFrom: [
        'backend/src/**/*.js',
        '!backend/src/server.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    setupFiles: ['<rootDir>/jest.setup.js']
};
