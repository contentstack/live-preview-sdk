import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    test: {
        alias: {
            "react/jsx-dev-runtime": "preact/jsx-runtime",
        },
        environment: "jsdom",
        coverage: {
            provider: "v8",
            // Only include source files - this is MUCH faster than all: true
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "dist/**",
                "**/*.d.ts",
                "node_modules/**",
                "**/*.types.ts",
                "**/*.test.*",
                "**/*.test.tsx",
                "**/*.mock.*",
                "**/__mocks__/**",
                "**/__tests__/**",
                "**/__test__/**",
                "**/*.config.*",
                "**/tsconfig.*",
                "vitest.reporter.ts",
                "vitest.setup.ts",
            ],
            // CRITICAL: Set to false - only analyze files that are actually imported/used
            // This makes coverage 3x faster by skipping unused files
            all: false,
            clean: false,
            // Explicitly set coverage output directory
            reportsDirectory: "./coverage",
            // Coverage reporters: Controls what format coverage reports are generated in
            reporter: process.env.CI
                ? ["json-summary", "json"] // Minimal: only json-summary for CI action, json for artifacts
                : ["text", "html"], // Full reports locally
            // Generate coverage even on test failures (needed for CI)
            reportOnFailure: true,
        },
        globals: true,
        setupFiles: "./vitest.setup.ts",
        // Timeouts - increased for CI to handle slower async operations
        testTimeout: 100000,
        hookTimeout: 100000,
        teardownTimeout: 5000,
        // Enable file parallelization
        fileParallelism: true,
        // Use threads pool for better performance on multi-core systems
        pool: "threads",
        // Set lower threshold to identify slow tests
        slowTestThreshold: 6000,
        // Isolate tests for better parallelization
        isolate: true,
        // Reduce overhead
        css: false,
        // Test reporters: Controls how test execution results are displayed/output
        reporters: process.env.CI ? ["verbose"] : ["verbose", "html"],
        outputFile: {
            json: "./test-results.json",
            junit: "./junit.xml",
            html: "./test-reports/index.html",
        },
    },
});
