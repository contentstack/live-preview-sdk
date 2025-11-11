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
        // Reduce retry attempts - with optimized tests, we don't need many retries
        retry: process.env.CI ? 1 : 0,
        // Keep reasonable timeouts for CI environment
        testTimeout: 30000,
        hookTimeout: 30000,
        teardownTimeout: 10000,
        // Enable file parallelization
        fileParallelism: true,
        // Use threads pool for better performance on multi-core systems
        pool: "threads",
        // Vitest v4: maxThreads/minThreads are replaced with maxWorkers/minWorkers
        maxWorkers: process.env.CI ? 4 : undefined,
        minWorkers: process.env.CI ? 2 : undefined,
        // Set lower threshold to identify slow tests
        slowTestThreshold: 5000,
        // Isolate tests for better parallelization
        isolate: true,
        // Reduce overhead
        css: false,
    },
});
