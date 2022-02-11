import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'frontend',
    displayName: 'Frontend',
    roots: ['<rootDir>'],
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
};
