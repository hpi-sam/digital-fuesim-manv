/**
 * This extension should be imported in projects with angular components.
 * Be aware that the `typescript.eslintrc.cjs` file should be imported afterwards.
 */
module.exports = {
    plugins: [
        'eslint-plugin-rxjs-angular',
        'eslint-plugin-rxjs',
        '@angular-eslint/eslint-plugin',
    ],
    extends: [
        'plugin:@angular-eslint/recommended',
        'plugin:@angular-eslint/recommended--extra',
        'plugin:rxjs/recommended',
        // TODO: doesn't work for some reason from this config and has to be imported separately
        // 'prettier',
    ],
    rules: {
        /**
         * @angular-eslint
         */
        '@angular-eslint/directive-selector': [
            'warn',
            {
                type: 'attribute',
                prefix: 'app',
                style: 'camelCase',
            },
        ],
        '@angular-eslint/component-selector': [
            'warn',
            {
                type: 'element',
                prefix: 'app',
                style: 'kebab-case',
            },
        ],
        '@angular-eslint/component-class-suffix': 'warn',
        '@angular-eslint/component-max-inline-declarations': 'warn',
        '@angular-eslint/no-attribute-decorator': 'warn',
        '@angular-eslint/no-conflicting-lifecycle': 'warn',
        '@angular-eslint/no-host-metadata-property': 'warn',
        '@angular-eslint/no-input-rename': 'warn',
        '@angular-eslint/no-inputs-metadata-property': 'warn',
        '@angular-eslint/no-lifecycle-call': 'warn',
        '@angular-eslint/no-output-native': 'warn',
        '@angular-eslint/no-output-on-prefix': 'warn',
        '@angular-eslint/no-output-rename': 'warn',
        '@angular-eslint/no-outputs-metadata-property': 'warn',
        '@angular-eslint/no-pipe-impure': 'warn',
        '@angular-eslint/no-queries-metadata-property': 'warn',
        '@angular-eslint/pipe-prefix': 'warn',
        '@angular-eslint/prefer-output-readonly': 'warn',
        '@angular-eslint/use-component-selector': 'warn',
        '@angular-eslint/use-lifecycle-interface': 'warn',
        '@angular-eslint/use-pipe-transform-interface': 'warn',
        /**
         * eslint-plugin-rxjs
         */
        'rxjs/ban-observables': 'warn',
        'rxjs/ban-operators': 'warn',
        'rxjs/no-connectable': 'warn',
        'rxjs/no-cyclic-action': 'warn',
        'rxjs/no-finnish': 'off',
        'rxjs/no-ignored-observable': 'warn',
        'rxjs/no-ignored-subscribe': 'warn',
        'rxjs/no-unsafe-catch': 'warn',
        'rxjs/no-unsafe-first': 'warn',
        'rxjs/throw-error': 'warn',
        'rxjs/no-implicit-any-catch': ['warn', { allowExplicitAny: true }],
        'rxjs/no-nested-subscribe': 'warn',
        'rxjs/no-unsafe-subject-next': 'off',
        /**
         * eslint-plugin-rxjs-angular
         */
        'rxjs-angular/prefer-takeuntil': [
            'warn',
            {
                alias: ['destroyed'],
                checkComplete: false,
                checkDecorators: ['Component'],
                checkDestroy: false,
            },
        ],
    },
};
