// @ts-check
import js from '@eslint/js'
import ts from 'typescript-eslint'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'
import eslintPluginImportX from 'eslint-plugin-import-x'
import { defineConfig, globalIgnores } from 'eslint/config'
import eslintPluginUnicorn from 'eslint-plugin-unicorn'

export default defineConfig([
  globalIgnores(['out/', 'src/test/suite/fixtures/']),
  js.configs.recommended,
  ts.configs.recommended,
  eslintPluginUnicorn.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  eslintPluginImportX.flatConfigs.typescript,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: '2019',
        sourceType: 'module',
      },
    },
    settings: {
      'import-x/extensions': ['.js', '.cjs', '.mjs', '.jsx', '.ts'],
      'import-x/core-modules': ['vscode'],
    },
    rules: {
      'import-x/extensions': 'off',
      'import-x/first': 'error',
      'import-x/newline-after-import': 'error',
      'import-x/no-absolute-path': 'error',
      'import-x/no-amd': 'error',
      'import-x/no-anonymous-default-export': 'error',
      'import-x/no-cycle': 'error',
      'import-x/no-deprecated': 'error',
      'import-x/no-duplicates': [
        'error',
        {
          'prefer-inline': true,
        },
      ],
      'import-x/no-dynamic-require': 'warn',
      'import-x/no-empty-named-blocks': 'error',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-mutable-exports': 'error',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'error',
      'import-x/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],
        },
      ],
      'unicorn/filename-case': [
        'error',
        {
          cases: {
            camelCase: true,
            pascalCase: true,
            kebabCase: false,
            snakeCase: false,
          },
        },
      ],
      'unicorn/import-style': 'off',
      'unicorn/no-array-for-each': 'off',
      'unicorn/no-null': 'off',
      'unicorn/no-process-exit': 'off',
      'unicorn/prefer-string-replace-all': 'off', // Requires `lib:["es2021"]`
      'unicorn/prefer-ternary': 'off',
      'unicorn/prevent-abbreviations': 'off',
      'unicorn/text-encoding-identifier-case': [
        'off',
        {
          withDash: false,
        },
      ],
    },
  },
  {
    files: ['src/test/**/*'],
    languageOptions: {
      globals: globals.mocha,
    },
  },
])
