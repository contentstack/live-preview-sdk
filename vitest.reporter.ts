import type { Reporter, Task, File } from "vitest";
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

    onTaskUpdate(packs: any[], events?: any[]) {
        // Vitest's onTaskUpdate receives TaskResultPack[] which is a tuple of [id, result, meta]
        // We'll collect profiles here as tests complete, but onFinished will have the final state
        // Try to extract task information from packs if available
        try {
            packs.forEach((pack: any) => {
                // Pack might be a tuple [id, result, meta] or an object with tasks
                if (Array.isArray(pack) && pack.length >= 2) {
                    const result = pack[1];
                    if (result && result.tasks) {
                        this.collectTestProfiles(result.tasks);
                    }
                } else if (pack && pack.tasks) {
                    this.collectTestProfiles(pack.tasks);
                }
            });
        } catch (error) {
            // Silently fail - we'll collect in onFinished anyway
        }
    }

    private collectTestProfiles(tasks: Task[]) {
        tasks.forEach((task) => {
            // Recursively collect from suites
            if (task.type === "suite" && task.tasks) {
                this.collectTestProfiles(task.tasks);
            }

            if (task.type === "test") {
                // Determine status - improved failure detection
                let status: "passed" | "failed" | "skipped" = "skipped";

                // Check if test is skipped
                if (task.mode === "skip") {
                    status = "skipped";
                } else if (task.result) {
                    // Test has completed - check result state
                    if (task.result.state === "pass") {
                        status = "passed";
                    } else if (task.result.state === "fail") {
                        // Explicitly failed
                        status = "failed";
                    } else if (task.result.state === "skip") {
                        status = "skipped";
                    } else if (
                        task.result.errors &&
                        task.result.errors.length > 0
                    ) {
                        // Has errors even if state isn't "fail"
                        status = "failed";
                    }
                } else {
                    // No result yet - check if it has errors (might be in progress but failed)
                    const result = task.result as any;
                    if (
                        result &&
                        result.errors &&
                        Array.isArray(result.errors) &&
                        result.errors.length > 0
                    ) {
                        status = "failed";
                    }
                }

                // Extract error details with improved line number detection
                let errorDetails: TestProfile["errorDetails"] | undefined;
                const error = task.result?.errors?.[0];
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

                    // Try multiple methods to extract line number
                    let lineNumber: number | undefined;
                    let columnNumber: number | undefined;

                    // Method 1: Extract from error message (Vitest format: "file.test.ts:187:65")
                    const messageLineMatch = errorMessage.match(/:(\d+):(\d+)/);
                    if (messageLineMatch) {
                        lineNumber = parseInt(messageLineMatch[1], 10);
                        columnNumber = parseInt(messageLineMatch[2], 10);
                    }

                    // Method 2: Extract from stack trace (format: "at ... (file.test.ts:187:65)")
                    if (!lineNumber && error.stack) {
                        // Try multiple patterns
                        const patterns = [
                            /\(([^:]+):(\d+):(\d+)\)/, // (file:line:column)
                            /at\s+[^(]+\(([^:]+):(\d+):(\d+)\)/, // at ... (file:line:column)
                            /:(\d+):(\d+)/, // :line:column
                        ];

                        for (const pattern of patterns) {
                            const match = error.stack.match(pattern);
                            if (match) {
                                // Get line number from match (could be at index 2 or 1 depending on pattern)
                                const lineIdx = match.length > 3 ? 2 : 1;
                                const colIdx = match.length > 3 ? 3 : 2;
                                lineNumber = parseInt(match[lineIdx], 10);
                                columnNumber = parseInt(match[colIdx], 10);
                                if (lineNumber && !isNaN(lineNumber)) break;
                            }
                        }
                    }

                    // Method 3: Extract from Vitest's error location if available
                    if (!lineNumber && (error as any).location) {
                        lineNumber = (error as any).location.line;
                        columnNumber = (error as any).location.column;
                    }

                    if (lineNumber) {
                        errorDetails.line = lineNumber;
                        if (columnNumber) {
                            errorDetails.column = columnNumber;
                        }
                    }
                }

                const profile: TestProfile = {
                    id: task.id,
                    name: task.name,
                    duration: task.result?.duration || 0,
                    status,
                    file: (task.file as File)?.filepath || "unknown",
                    retries: task.result?.retryCount || 0,
                    error: error?.message || error?.stack?.split("\n")[0],
                    errorDetails,
                };

                // Always update/add profile if test has a result or is skipped
                // This ensures we capture the final state
                if (
                    task.result ||
                    task.mode === "skip" ||
                    status === "failed"
                ) {
                    // Update or add profile
                    const existingIndex = this.profiles.findIndex(
                        (p) => p.id === profile.id
                    );

                    if (existingIndex >= 0) {
                        // Update existing profile, but preserve failed status if it was already failed
                        if (
                            this.profiles[existingIndex].status === "failed" &&
                            status !== "failed"
                        ) {
                            // Keep the failed status
                            profile.status = "failed";
                        }
                        this.profiles[existingIndex] = profile;
                    } else {
                        this.profiles.push(profile);
                    }
                }
            }
        });
    }

    async onFinished(files?: File[], errors?: unknown[]) {
        try {
            if (!this.isInitialized) {
                console.error("Profiler was not initialized properly");
                return;
            }

            // Collect any remaining profiles from files - this is critical to get final states
            if (files) {
                this.collectTestProfiles(files);
            }

            // Also process errors if provided
            if (errors && errors.length > 0) {
                // Errors array might contain file-level errors
                // We'll rely on the files array for test-level errors
            }

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
