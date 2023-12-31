import { IDldcConfigResolved } from '../tasks/readPackageJson';

export function createEslintConfig(dldcConfig: IDldcConfigResolved): any {
  return {
    parser: '@typescript-eslint/parser',
    parserOptions: {
      warnOnUnsupportedTypeScriptVersion: false,
      project: true,
    },
    plugins: ['@typescript-eslint'],
    extends: [
      'plugin:@typescript-eslint/recommended-type-checked',
      'prettier',
      dldcConfig.react ? 'plugin:react-hooks/recommended' : null,
    ].filter(Boolean),
    root: true,
    rules: {
      '@typescript-eslint/ban-types': 'off',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/unbound-method': 'off',
      'no-constant-condition': 'off',
    },
  };
}
