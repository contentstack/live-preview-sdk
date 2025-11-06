import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
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
        retry: 2,
        testTimeout: 30000, // Reduced from 30s to 15s
        hookTimeout: 30000, // Reduced from 30s to 15s
        // Enable file parallelization
        fileParallelism: true,
        // Optimize pool for better performance
        pool: "forks", // Better isolation and parallel performance
        poolOptions: {
            forks: {
                // Use more workers on CI
                maxForks: process.env.CI ? 4 : undefined,
                minForks: process.env.CI ? 2 : undefined,
            },
        },
    },
});
