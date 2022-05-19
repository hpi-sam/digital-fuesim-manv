import baseConfig from '../jest.base.config.js';

export default {
    ...baseConfig,
    name: 'backend',
    displayName: 'Backend',
    roots: ['<rootDir>'],
    // See https://kulshekhar.github.io/ts-jest/docs/next/guides/esm-support/
    // and https://jestjs.io/docs/ecmascript-modules
    extensionsToTreatAsEsm: ['.ts'],
    globals: {
        'ts-jest': {
            useESM: true,
        },
    },
    collectCoverageFrom: ['./src/**/*.ts'],
    coveragePathIgnorePatterns: [
        './src/index.ts',
        './src/database/migration-datasource.ts',
        './src/database/data-source.ts',
        './src/database/migrations/*',
    ],
    moduleNameMapper: {
        '^(\\.{1,2}/.*)\\.js$': '$1',
    },
};
