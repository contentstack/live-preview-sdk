import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        testTimeout: 40000,
        alias: {
            "react/jsx-dev-runtime": "preact/jsx-runtime",
        },
        environment: "jsdom",
        coverage: {
            all: true,
            reporter: ["text", "html", "clover", "json", "json-summary"],
            reportOnFailure: true,
        },
        globals: true,
        setupFiles: "./vitest.setup.ts",
    },
});
