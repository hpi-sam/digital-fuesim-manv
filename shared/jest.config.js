import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'shared',
    displayName: 'Shared',
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
    // See here: https://github.com/nestjs/nest/issues/1305#issuecomment-488337778
    setupFiles: ['./src/index.ts'],
};
