import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'backend',
    displayName: 'Backend',
    setupFiles: ['dotenv/config'],
    roots: ['<rootDir>'],
    // See https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
    // and https://jestjs.io/docs/ecmascript-modules
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
