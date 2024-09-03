module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true,
        node: true,
    },
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "prettier", // This prevents conflicts between eslint and prettier. This should be last
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: 12,
        sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/prefer-const": 0,
        "@typescript-eslint/no-this-alias": 0,
        "@typescript-eslint/ban-ts-comment": 0,
        "prefer-rest-params": 0,
        "@typescript-eslint/no-unused-vars": [
            "warn",
            { argsIgnorePattern: "^_" },
        ],
        "@typescript-eslint/no-empty-function": 0,
    },
};
