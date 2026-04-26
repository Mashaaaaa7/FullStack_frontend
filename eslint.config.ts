import js from "@eslint/js";
import globals from "globals";
import tslint from "typescript-eslint";
import type { Linter } from "eslint";

const config: Linter.Config[] = [
    {
        ignores: ["dist/**", "coverage/**", "node_modules/**"],
    },
    js.configs.recommended,
    ...tslint.configs.recommended,
    {
        files: ["**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
            },
        },
        rules: {
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "warn",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
        },
    },
];

export default config;