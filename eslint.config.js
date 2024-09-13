import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import "eslint-plugin-only-warn";

export default [
    { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
    { languageOptions: { globals: globals.browser } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    eslintConfigPrettier,
    {
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            // allow unused vars with underscore prefix
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    destructuredArrayIgnorePattern: "^_",
                },
            ],
        },
    },
];
