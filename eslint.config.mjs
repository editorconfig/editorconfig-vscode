// @ts-check
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import ts from 'typescript-eslint'
import prettier from 'eslint-config-prettier/flat'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['out/', 'src/test/suite/fixtures/']),
  js.configs.recommended,
  ts.configs.recommended,
  prettier,
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: '2016',
        sourceType: 'module',
      },
      globals: {
        fetch: true,
      },
    },
    rules: {
      // Possible Errors
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-misleading-character-class': 'error',
      'no-template-curly-in-string': 'error',

      // TypeScript-ESLint (Prettier)
      '@typescript-eslint/member-delimiter-style': 'off',
      '@typescript-eslint/camelcase': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-extra-semi': 'off',
      '@typescript-eslint/no-object-literal-type-assertion': 'off',
      '@typescript-eslint/no-parameter-properties': 'off',
      '@typescript-eslint/no-this-alias': [
        'error',
        {
          allowDestructuring: true,
        },
      ],
      '@typescript-eslint/no-use-before-define': 'off',
    },
  },
  {
    files: ['src/test/**/*'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    rules: {
      'no-async-promise-executor': 'off',
      'no-await-in-loop': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
    },
  },
])
