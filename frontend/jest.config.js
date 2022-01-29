import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'frontend',
    displayName: 'Frontend',
    roots: ['<rootDir>'],
    // overwrites the configuration from baseConfig
    transform: {},
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/src/test.ts'],
};
