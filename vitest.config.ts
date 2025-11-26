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
                "src/visualBuilder/components/icons/fields/**",
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
        reporters: process.env.CI
            ? ["verbose", "json", "junit", "github-actions"]
            : ["verbose", "html", "./vitest.reporter.ts"],
        outputFile: {
            json: "./test-results.json",
            junit: "./junit.xml",
            html: "./test-reports/index.html",
        },
    },
});
