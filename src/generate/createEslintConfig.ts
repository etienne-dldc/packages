import { IDldcConfigResolved } from '../tasks/readDldcConfig';
import { json } from '../utils/json';

export function createEslintConfig(dldcConfig: IDldcConfigResolved): any {
  return [
    `import eslint from '@eslint/js';`,
    `import tseslint from 'typescript-eslint';`,
    dldcConfig.react ? `import hooksPlugin from "eslint-plugin-react-hooks";` : null,
    ``,
    `export default tseslint.config(`,
    json({
      ignores: ['dist', 'coverage'],
    }) + ',',
    `  eslint.configs.recommended,`,
    `  ...tseslint.configs.recommendedTypeChecked,`,
    json({
      languageOptions: {
        parserOptions: {
          sourceType: 'module',
          ecmaVersion: 2020,
          project: true,
          tsconfigRootDir: json.raw(`import.meta.dirname`),
        },
      },
      rules: {
        'no-constant-condition': 'off',
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
      },
    }) + ',',
    json({
      files: ['**/*.js'],
      extends: [json.raw('tseslint.configs.disableTypeChecked')],
    }) + ',',
    dldcConfig.react
      ? json({
          plugins: {
            'react-hooks': json.raw('hooksPlugin'),
          },
          rules: json.raw(`hooksPlugin.configs.recommended.rules`),
        }) + ','
      : null,
    `);`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}
