import eslint from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  {
    ignores: [
      'out/**',
      'src/test/suite/fixtures/**'
    ]
  },
  eslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true
        },
        ecmaVersion: 6,
        project: './tsconfig.json',
        sourceType: 'module',
        tsconfigRootDir: '.'
      },
      globals: {
        fetch: true
      }
    },
    plugins: {
      '@typescript-eslint': tseslint
    },
    rules: {
      // Possible Errors
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'error',
      'no-misleading-character-class': 'error',
      'no-template-curly-in-string': 'error',

      // TypeScript-ESLint
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
          'allowDestructuring': true
        }
      ],
      '@typescript-eslint/no-use-before-define': 'off'
    }
  },
  prettier
];
