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
            exclude: [
                "dist/**",
                "build/**",
                "**/*.d.ts",
                "scripts/**",
                "tests/**",
                "**/*.stories.*",
                "**/*.test.*",
                "node_modules/**",
            ],
            all: true,
            reporter: process.env.CI
                ? ["clover", "html", "text-summary"] // CI-friendly + fast
                : ["text"], // fastest locally
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
        poolOptions: {
            threads: {
                // Optimize worker count for CI
                maxThreads: process.env.CI ? 4 : undefined,
                minThreads: process.env.CI ? 2 : undefined,
                // Isolate tests to prevent side effects
                singleThread: false,
            },
        },
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
