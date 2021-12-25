/**
 * These are the default settings for all Jest tests, that can be overwritten in individual configs.
 *
 * Everything related to the code coverage has to be specified in the global config. https://github.com/facebook/jest/issues/4255#issuecomment-321939025
 */
export default {
    verbose: true,
    moduleFileExtensions: ['js', 'json', 'ts'],
    transform: {
        '^.+\\.ts$': 'ts-jest',
    },
    moduleDirectories: ['node_modules', 'src'],
    testEnvironment: 'node',
    testRegex: '\\.spec\\.ts$',
};
