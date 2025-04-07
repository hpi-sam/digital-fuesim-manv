import { globalIgnores } from 'eslint/config';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'eslint-config-prettier/flat';
import sharedTypescript from '../.eslint/typescript.eslintrc.mjs';
import sharedAngularTypescript from '../.eslint/angular-typescript.eslintrc.mjs';
import sharedAngularTemplate from '../.eslint/angular-template.eslintrc.mjs';
import { includeIgnoreFile } from '@eslint/compat';

import _import from 'eslint-plugin-import';
import unicorn from 'eslint-plugin-unicorn';
import ts from 'typescript-eslint';
import js from '@eslint/js';

import rxjsX from 'eslint-plugin-rxjs-x';
import rxjsAngularX from 'eslint-plugin-rxjs-angular-x';
import angular from 'angular-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, '.gitignore');

export default ts.config([
    globalIgnores(['**/index.html', '**/assets/about/*.html']),
    includeIgnoreFile(gitignorePath),
    js.configs.recommended,
    ts.configs.recommended,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    {
        extends: [
            _import.flatConfigs.recommended,
            _import.flatConfigs.typescript,
            ...angular.configs.tsRecommended,
            rxjsX.configs.recommended,
            sharedAngularTypescript,
            sharedTypescript,
        ],

        plugins: {
            unicorn,
            'rxjs-angular-x': rxjsAngularX,
        },

        processor: angular.processInlineTemplates,
    },
    {
        files: ['*.component.html'], // TODO: Does not work when just importing from sharedAngularTemplate…
        extends: [angular.configs.templateRecommended, sharedAngularTemplate],
    },
    prettier,
]);
