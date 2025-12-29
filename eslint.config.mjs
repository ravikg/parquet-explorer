import typescript from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import eslint from "@eslint/js";

export default [
    // Ignore common patterns
    {
        ignores: [
            "out/**",
            "node_modules/**",
            "*.js",
            ".vscode-test/**"
        ]
    },

    // Base JS recommended rules
    eslint.configs.recommended,

    // TypeScript configuration
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2020,
                sourceType: "module",
                project: "./tsconfig.json"
            }
        },
        plugins: {
            "@typescript-eslint": typescript
        },
        rules: {
            ...typescript.configs.recommended.rules,
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-unused-vars": ["error", {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_"
            }]
        }
    }
];
