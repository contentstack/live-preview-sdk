import { defineConfig } from "vitest/config";

// https://vitejs.dev/config/
export default defineConfig({
    // Enable source maps for better coverage reporting
    build: {
        sourcemap: true,
    },
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
                "build/**",
                "coverage/**",
                "scripts/**",
                "**/*.d.ts",
                "node_modules/**",
                "**/*.types.ts",
                "**/*.test.*",
                "**/*.test.tsx",
                "**/*.mock.*",
                "**/*.stories.*",
                "**/__mocks__/**",
                "**/__tests__/**",
                "**/__test__/**",
                "**/*.config.*",
                "**/vite.config.*",
                "**/eslint.config.*",
                "**/webpack.config.*",
                "**/rollup.config.*",
                "vitest.reporter.ts",
                "vitest.setup.ts",
            ],
            // Note: In Vitest 4, 'all' option was removed - coverage only analyzes imported files by default
            // This makes coverage faster by skipping unused files
            clean: false,
            // Explicitly set coverage output directory
            reportsDirectory: "./coverage",
            // Use minimal reporters in CI for speed - only what's needed
            reporter: process.env.CI
                ? ["json-summary", "json"] // Minimal: only json-summary for CI action, json for artifacts
                : ["text", "html"], // Full reports locally
            // Generate coverage even on test failures (needed for CI)
            reportOnFailure: true,
        },
        globals: true,
        setupFiles: "./vitest.setup.ts",
        // Reduce retry attempts - with optimized tests, we don't need many retries
        retry: 0,
        // Timeouts - increased for CI to handle slower async operations
        testTimeout: 200000,
        hookTimeout: 200000,
        teardownTimeout: 5000,
        // Enable file parallelization
        fileParallelism: true,
        // Use threads pool for better performance on multi-core systems
        pool: "threads",
        // Pool options for threads (Vitest 4 structure)
        // Note: minThreads removed in Vitest 4, only maxThreads is effective
        maxWorkers: process.env.CI ? 4 : undefined,
        // Set lower threshold to identify slow tests
        slowTestThreshold: 5000,
        // Isolate tests for better parallelization
        isolate: true,
        // Reduce overhead
        css: false,
        // Enhanced reporting for CI/CD debugging
        reporters: process.env.CI
            ? [
                  "verbose",
                  "json",
                  "junit",
                  "github-actions",
                  "./vitest.reporter.ts",
              ]
            : ["verbose", "./vitest.reporter.ts"],
        outputFile: {
            json: "./test-results.json",
            junit: "./junit.xml",
        },
        // Enable detailed logging in CI for debugging failures
        logHeapUsage: process.env.CI === "true",
        // Bail on first failure in CI to save time (optional)
        // bail: process.env.CI ? 1 : undefined,
    },
});
