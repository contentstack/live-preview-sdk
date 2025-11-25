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
            // Vitest 4: only imported files are analyzed, so include full source
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                // Output / build
                "dist/**",
                "build/**",
                "coverage/**",

                // Tooling & scripts
                "vite.config.*",
                "eslint.config.*",
                "rollup.config.*",
                "webpack.config.*",
                "vitest.config.*",
                "vitest.setup.*",
            ],
            clean: false,
            reportsDirectory: "./coverage",
            reportOnFailure: true,
            reporter: process.env.CI
                ? ["json-summary", "json"] // Fast & machine-readable on CI
                : ["text", "html", "json"], // Human-friendly locally
        },
        globals: true,
        setupFiles: "./vitest.setup.ts",
        // Reduce retry attempts - with optimized tests, we don't need many retries
        retry: 0,
        // Timeouts - increased for CI to handle slower async operations
        testTimeout: 100000,
        hookTimeout: 100000,
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
