import love from 'eslint-config-love'

export default [
  {
    ...love,
    files: ['**/*.js', '**/*.ts']
  },
  {
    rules: {
      "@typescript-eslint/no-magic-numbers": 0,
      "eslint-comments/require-description": 0,
      "complexity": 0
    }
  }
]