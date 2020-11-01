module.exports = {
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
  },
  settings: {
    react: {
      version: 'detect', // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  extends: [
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'key-spacing': ['error', {
      "multiLine": {
        "beforeColon": false,
        "afterColon": true,
    },
    align: {
      "beforeColon": false,
      "afterColon": true,
      "on": "colon"
    }}],
    "object-curly-newline": ["error", {
        "ObjectExpression":  { "multiline": true, "minProperties": 3 },
        "ObjectPattern": { "multiline": true, "minProperties": 3 },
        "ImportDeclaration": { "multiline": true, "minProperties": 3 },
        "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    }],
    "object-property-newline": "error",
    'no-multi-spaces': ["error", { exceptions: {
      "Property": true,
      "BinaryExpression": true,
      "VariableDeclaration": false,
      "ImportDeclaration": true,
    }}],
    'max-len': ["error", { "code": 120 }],
    'indent': ["error", 2],
    "quotes": ["error", "single"],
    'comma-dangle': ["error", "never"],
    'object-curly-spacing': ["error", "always"],
    'arrow-parens': ["error", "as-needed"],
    'linebreak-style': 0
  },
};
