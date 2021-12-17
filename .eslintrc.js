module.exports = {
    env: {
        es2021: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'standard',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:nestjs/recommended',
        'plugin:import/typescript',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 12,
        project: './tsconfig.json',
        createDefaultProgram: true,
    },
    plugins: ['@typescript-eslint', 'nestjs'],
    ignorePatterns: ['src/migrations/**/*.ts'],
    rules: {
        // Indent must be off in order for the rule below to work correctly.
        // See: https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
        indent: 'off',
        '@typescript-eslint/indent': ['error', 2],

        'linebreak-style': ['error', 'unix'],
        quotes: ['error', 'single'],
        semi: ['error', 'never'],
        // We use a global validation pipe, no need to
        // verify this at every controller / route.
        'nestjs/use-validation-pipe': 'off',
        'import/first': 'error',
        'import/named': 'error',
        'import/namespace': 'error',
        'import/default': 'error',
        'import/export': 'error',
        'import/order': [
            'error',
            {
                groups: [
                    'builtin',
                    'external',
                    'internal',
                    'index',
                    ['sibling', 'parent'],
                ],
                'newlines-between': 'always',
                alphabetize: {
                    order: 'asc',
                },
            },
        ],
        'no-console': 'error',
        'space-before-function-paren': [
            'error',
            {
                anonymous: 'always',
                named: 'never', // Only remove spaces for something like function abc() {}
                asyncArrow: 'always',
            },
        ],
        'no-warning-comments': 'warn',

        'comma-dangle': ['error', 'always-multiline'],

        '@typescript-eslint/no-unused-vars': 'error',
        '@typescript-eslint/explicit-module-boundary-types': 'error',

        // we need this due to our injections in services and controllers
        'no-useless-constructor': 'off',
    },
    settings: {
        // This uses the eslint-import-resolver-typescript npm module to properly
        // resolve the imports. Without it, the linter thinks 'utils/error' is an
        // external package, whereas it is just an absolute import.
        'import/resolver': 'typescript',
    },
};
