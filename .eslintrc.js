module.exports = {
  'env': {
    'commonjs': true,
    'node': true
  },
  'extends': [
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  'globals': {
    'Atomics': 'readonly',
    'SharedArrayBuffer': 'readonly'
  },
  'parserOptions': {
    'ecmaVersion': 2018
  },
  'rules': {
  }
}
