const nextJest = require('next/jest')

// Providing the path to your Next.js app to load next.config.js and .env files in your test environment
const createJestConfig = nextJest({
  dir: './',
})

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  // Add more setup options before each test is run
  // setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // if you have a setup file
  testEnvironment: 'jest-environment-node', // or 'jsdom' if testing browser environments
  preset: 'ts-jest', // Use ts-jest preset
  moduleNameMapper: {
    // Handle module aliases (this will be automatically configured by next/jest)
    '^@/(.*)$': '<rootDir>/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'], // For global mocks
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(customJestConfig)
