module.exports = {
  // 运行环境：Node + ES 最新语法
  env: {
    node: true,
    es2022: true
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'script' // CommonJS 固定 script，ESM 才是 module
  },
  extends: [
    'eslint:recommended',
    // 整合 prettier：关闭冲突规则 + 把格式化纳入 eslint 校验
    'plugin:prettier/recommended'
  ],
  plugins: ['prettier'],
  rules: {
    // prettier 格式问题全部报 error
    'prettier/prettier': 'error',
    // 允许 console（后端必备）
    'no-console': 'off',
    // 未使用变量警告，参数以下划线开头不校验
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    // 禁止 var，强制 let/const
    'no-var': 'error',
    'prefer-const': 'warn',
    // 允许 require 动态引入
    'no-require-imports': 'off',
    'indent': ['error', 2],
  },
  // 跳过校验的目录/文件
  ignorePatterns: ['node_modules/', 'dist/', '*.config.js']
}
