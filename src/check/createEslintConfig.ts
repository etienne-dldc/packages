import { IConfig } from '../utils/loadConfig';

export function createEslintConfig(config: IConfig): any {
  return {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      warnOnUnsupportedTypeScriptVersion: false,
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
      config.react ? 'plugin:react-hooks/recommended' : null,
    ].filter(Boolean),
    root: true,
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      'no-constant-condition': 'off',
    },
  };
}
