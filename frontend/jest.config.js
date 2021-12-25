import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'frontend',
    displayName: 'Frontend',
    roots: ['<rootDir>'],
    // overwrites the configuration from baseConfig
    transform: {},
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
};
