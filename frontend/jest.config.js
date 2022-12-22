import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    displayName: 'Frontend',
    roots: ['<rootDir>'],
    testPathIgnorePatterns: ['<rootDir>/cypress/'],
    moduleNameMapper: {
        // lodash-es only exposes es-modules
        // See https://stackoverflow.com/a/54117206/12698757
        // Therefore we need to add loadsh to our devDependencies too
        '^lodash-es$': 'lodash',
    },
};
