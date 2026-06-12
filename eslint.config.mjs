// @ts-check
import prettier from 'eslint-plugin-prettier'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'

import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  plugins: {
    'vuejs-accessibility': vuejsAccessibility,
    'simple-import-sort': simpleImportSort,
    prettier,
  },
  rules: {
    curly: 'error',
    camelcase: ['error', { properties: 'never' }],
    complexity: ['warn', 10],
    'max-depth': ['error', 3],
    'no-console': 'warn',
    'no-alert': 'error',
    'vue/multi-word-component-names': 'off',
    'simple-import-sort/imports': 'error',
    'simple-import-sort/exports': 'error',
    'prettier/prettier': 'error',
  },
})
