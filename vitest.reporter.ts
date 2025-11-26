import type {
    Reporter,
    TestCase,
    TestModule,
    TestRunEndReason,
    SerializedError,
} from "vitest/node";
import { promises as fs } from "fs";
import path from "path";

interface TestProfile {
    id: string;
    name: string;
    duration: number;
    status: "passed" | "failed" | "skipped";
    file: string;
    retries: number;
    error?: string;
    errorDetails?: {
        message: string;
        stack?: string;
        line?: number;
        column?: number;
        timeout?: boolean;
        slowLines?: Array<{ line: number; duration: number }>;
    };
}

export default class ProfileReporter implements Reporter {
    private profiles: TestProfile[] = [];
    private startTime: number = 0;
    private isInitialized: boolean = false;

    onInit() {
        try {
            this.startTime = Date.now();
            this.isInitialized = true;
            const message = "\n🔍 Test Profiler Initialized";
            const ciMode = `📊 CI Mode: ${process.env.CI ? "YES" : "NO"}`;
            const startedAt = `🕐 Started at: ${new Date().toISOString()}\n`;

            // Use both stderr and stdout for CI to ensure visibility
            if (process.env.CI) {
                const initOutput = `${message}\n${ciMode}\n${startedAt}\n`;
                process.stderr.write(initOutput);
                console.log(initOutput);
            } else {
                console.log(message);
                console.log(ciMode);
                console.log(startedAt);
            }
        } catch (error) {
            console.error("Failed to initialize profiler:", error);
        }
    }

    // Vitest 4 API: Called when a test case finishes
    onTestCaseResult(testCase: TestCase) {
        try {
            const result = testCase.result();
            const diagnostic = testCase.diagnostic();

            let status: "passed" | "failed" | "skipped" = "skipped";
            if (result.state === "passed") {
                status = "passed";
            } else if (result.state === "failed") {
                status = "failed";
            } else if (result.state === "skipped") {
                status = "skipped";
            }

            // Extract error details
            let errorDetails: TestProfile["errorDetails"] | undefined;
            const error = result.errors?.[0];
            if (error) {
                const errorMessage =
                    error.message ||
                    error.stack?.split("\n")[0] ||
                    "Unknown error";
                const isTimeout =
                    errorMessage.toLowerCase().includes("timeout") ||
                    errorMessage.toLowerCase().includes("exceeded") ||
                    error.stack?.toLowerCase().includes("timeout") ||
                    false;

                errorDetails = {
                    message: errorMessage,
                    stack: error.stack,
                    timeout: isTimeout,
                };

                // Extract line number from location
                if (testCase.location) {
                    errorDetails.line = testCase.location.line;
                    errorDetails.column = testCase.location.column;
                }
            }

            const profile: TestProfile = {
                id: testCase.id,
                name: testCase.name,
                duration: diagnostic?.duration || 0,
                status,
                file: testCase.module.moduleId || "unknown",
                retries: (result as any).retryCount || 0,
                error: error?.message || error?.stack?.split("\n")[0],
                errorDetails,
            };

            // Update or add profile
            const existingIndex = this.profiles.findIndex(
                (p) => p.id === profile.id
            );
            if (existingIndex >= 0) {
                this.profiles[existingIndex] = profile;
            } else {
                this.profiles.push(profile);
            }
        } catch (error) {
            // Silently fail - we'll still generate report in onTestRunEnd
        }
    }

    private collectTestProfilesFromModule(testModule: TestModule) {
        // Collect all test cases from the module using Vitest 4 API
        try {
            for (const testCase of testModule.children.allTests()) {
                const result = testCase.result();
                const diagnostic = testCase.diagnostic();

                let status: "passed" | "failed" | "skipped" = "skipped";
                if (result.state === "passed") {
                    status = "passed";
                } else if (result.state === "failed") {
                    status = "failed";
                } else if (result.state === "skipped") {
                    status = "skipped";
                }

                // Extract error details
                let errorDetails: TestProfile["errorDetails"] | undefined;
                const error = result.errors?.[0];
                if (error) {
                    const errorMessage =
                        error.message ||
                        error.stack?.split("\n")[0] ||
                        "Unknown error";
                    const isTimeout =
                        errorMessage.toLowerCase().includes("timeout") ||
                        errorMessage.toLowerCase().includes("exceeded") ||
                        error.stack?.toLowerCase().includes("timeout") ||
                        false;

                    errorDetails = {
                        message: errorMessage,
                        stack: error.stack,
                        timeout: isTimeout,
                    };

                    if (testCase.location) {
                        errorDetails.line = testCase.location.line;
                        errorDetails.column = testCase.location.column;
                    }
                }

                const profile: TestProfile = {
                    id: testCase.id,
                    name: testCase.name,
                    duration: diagnostic?.duration || 0,
                    status,
                    file: testModule.moduleId || "unknown",
                    retries: (result as any).retryCount || 0,
                    error: error?.message || error?.stack?.split("\n")[0],
                    errorDetails,
                };

                // Update or add profile
                const existingIndex = this.profiles.findIndex(
                    (p) => p.id === profile.id
                );
                if (existingIndex >= 0) {
                    this.profiles[existingIndex] = profile;
                } else {
                    this.profiles.push(profile);
                }
            }
        } catch (error) {
            // Silently fail - profiles should already be collected via onTestCaseResult
        }
    }

    // Vitest 4 API: Called when test run ends
    async onTestRunEnd(
        testModules: ReadonlyArray<TestModule>,
        unhandledErrors: ReadonlyArray<unknown>,
        reason: unknown
    ) {
        try {
            if (!this.isInitialized) {
                console.error("Profiler was not initialized properly");
                return;
            }

            // Collect any remaining profiles from test modules
            testModules.forEach((module) => {
                this.collectTestProfilesFromModule(module);
            });

            const totalDuration = Date.now() - this.startTime;

            // Sort by duration (slowest first)
            const sorted = [...this.profiles].sort(
                (a, b) => b.duration - a.duration
            );

            const output: string[] = [];
            output.push("\n" + "=".repeat(80));
            output.push("📊 TEST PROFILING REPORT");
            output.push("=".repeat(80) + "\n");

            // Summary
            const passed = this.profiles.filter(
                (p) => p.status === "passed"
            ).length;
            const failed = this.profiles.filter(
                (p) => p.status === "failed"
            ).length;
            const skipped = this.profiles.filter(
                (p) => p.status === "skipped"
            ).length;
            const retriedTests = this.profiles.filter((p) => p.retries > 0);

            output.push(`✅ Passed: ${passed}`);
            output.push(`❌ Failed: ${failed}`);
            output.push(`⏭️  Skipped: ${skipped}`);
            output.push(`🔄 Retried: ${retriedTests.length}`);
            output.push(
                `⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`
            );

            // Top 10 slowest tests
            output.push("🐌 TOP 10 SLOWEST TESTS:");
            output.push("-".repeat(80));
            sorted.slice(0, 10).forEach((profile, index) => {
                const icon =
                    profile.status === "passed"
                        ? "✅"
                        : profile.status === "failed"
                          ? "❌"
                          : "⏭️";
                const fileName = path.basename(profile.file);
                output.push(
                    `${index + 1}. ${icon} ${(profile.duration / 1000).toFixed(2)}s - ${profile.name}`
                );
                output.push(`   📁 ${fileName}`);
                if (profile.retries > 0) {
                    output.push(`   🔄 Retried ${profile.retries} time(s)`);
                }
            });

            // Failed tests with detailed error information
            if (failed > 0) {
                output.push("\n" + "=".repeat(80));
                output.push("❌ FAILED TESTS:");
                output.push("-".repeat(80));
                this.profiles
                    .filter((p) => p.status === "failed")
                    .forEach((profile) => {
                        const fileName = path.basename(profile.file);
                        output.push(`\n📁 ${fileName}`);
                        output.push(`   Test: ${profile.name}`);
                        output.push(
                            `   Duration: ${(profile.duration / 1000).toFixed(2)}s`
                        );
                        if (profile.retries > 0) {
                            output.push(`   Retries: ${profile.retries}`);
                        }

                        // Enhanced error reporting with better formatting
                        if (profile.errorDetails) {
                            // Show failure location
                            if (profile.errorDetails.line) {
                                const filePath = profile.file;
                                const fileName = path.basename(filePath);
                                output.push(
                                    `   📍 Failed at: ${fileName}:${profile.errorDetails.line}${profile.errorDetails.column ? `:${profile.errorDetails.column}` : ""}`
                                );
                            }

                            // Show error message with better formatting
                            if (profile.errorDetails.message) {
                                let errorMsg = profile.errorDetails.message;

                                // Try to extract assertion details if it's an assertion error
                                if (
                                    errorMsg.includes("expected") &&
                                    errorMsg.includes("to be")
                                ) {
                                    const assertionMatch = errorMsg.match(
                                        /(expected .+? to be .+?)/
                                    );
                                    if (assertionMatch) {
                                        output.push(
                                            `   ❌ Assertion: ${assertionMatch[1]}`
                                        );
                                    }
                                }
                            }
                        } else if (profile.error) {
                            let errorMsg = profile.error;
                            if (errorMsg.length > 400) {
                                errorMsg = errorMsg.substring(0, 400) + "...";
                            }
                            output.push(`   💬 Error: ${errorMsg}`);
                        } else {
                            output.push(`   ⚠️  No error details available`);
                        }
                    });
            }

            output.push("\n" + "=".repeat(80) + "\n");

            // Print all output at once
            const finalOutput = output.join("\n");
            if (process.env.CI) {
                // In CI, write to both stderr and stdout to ensure visibility
                process.stderr.write(finalOutput + "\n");
                // Also write to stdout for GitHub Actions to capture
                console.log(finalOutput);
            } else {
                console.log(finalOutput);
            }
        } catch (error) {
            console.error("Error in profiling reporter:", error);
        }
    }
}
