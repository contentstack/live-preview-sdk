import type { Reporter, Task, File } from "vitest";
import { promises as fs } from "fs";
import path from "path";

interface TestProfile {
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

    onTaskUpdate(tasks: Task[]) {
        this.collectTestProfiles(tasks);
    }

    private collectTestProfiles(tasks: Task[]) {
        tasks.forEach((task) => {
            // Recursively collect from suites
            if (task.type === "suite" && task.tasks) {
                this.collectTestProfiles(task.tasks);
            }
            
            if (task.type === "test") {
                // Determine status - check multiple conditions for failures
                let status: "passed" | "failed" | "skipped" = "skipped";
                if (task.result) {
                    if (task.result.state === "pass") status = "passed";
                    else if (task.result.state === "fail" || task.result.state === "run") {
                        // Check if test actually failed (has errors or timed out)
                        if (task.result.errors && task.result.errors.length > 0) {
                            status = "failed";
                        } else if (task.result.state === "run" && task.result.duration === 0) {
                            // Test is still running or timed out
                            status = "failed";
                        } else {
                            status = task.result.state === "fail" ? "failed" : status;
                        }
                    } else if (task.result.state === "skip") {
                        status = "skipped";
                    }
                } else if (task.mode === "skip") {
                    status = "skipped";
                } else if (task.result?.state === "fail" || (task.result?.errors && task.result.errors.length > 0)) {
                    status = "failed";
                }

                // Extract error details with line numbers
                let errorDetails: TestProfile["errorDetails"] | undefined;
                const error = task.result?.errors?.[0];
                if (error) {
                    errorDetails = {
                        message: error.message || error.stack?.split('\n')[0] || "Unknown error",
                        stack: error.stack,
                        timeout: error.message?.includes("timeout") || error.message?.includes("Timeout") || false,
                    };
                    
                    // Try to extract line number from stack trace
                    if (error.stack) {
                        const lineMatch = error.stack.match(/\((.+):(\d+):(\d+)\)/);
                        if (lineMatch) {
                            errorDetails.line = parseInt(lineMatch[2], 10);
                            errorDetails.column = parseInt(lineMatch[3], 10);
                        }
                    }
                }

                const profile: TestProfile = {
                    name: task.name,
                    duration: task.result?.duration || 0,
                    status,
                    file: (task.file as File)?.filepath || "unknown",
                    retries: task.result?.retryCount || 0,
                    error: error?.message || error?.stack?.split('\n')[0],
                    errorDetails,
                };
                
                // Only add if test has completed (has result) or failed
                if (task.result || task.mode === "skip" || status === "failed") {
                    // Update or add profile
                    const existingIndex = this.profiles.findIndex(
                        p => p.name === profile.name && p.file === profile.file
                    );
                    
                    if (existingIndex >= 0) {
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

            // Collect any remaining profiles from files
            if (files) {
                this.collectTestProfiles(files);
            }
            
            const totalDuration = Date.now() - this.startTime;
            
            // Sort by duration (slowest first)
            const sorted = [...this.profiles].sort((a, b) => b.duration - a.duration);
            
            const output: string[] = [];
            output.push("\n" + "=".repeat(80));
            output.push("📊 TEST PROFILING REPORT");
            output.push("=".repeat(80) + "\n");
        
            // Summary
            const passed = this.profiles.filter(p => p.status === "passed").length;
            const failed = this.profiles.filter(p => p.status === "failed").length;
            const skipped = this.profiles.filter(p => p.status === "skipped").length;
            const retriedTests = this.profiles.filter(p => p.retries > 0);
            
            output.push(`✅ Passed: ${passed}`);
            output.push(`❌ Failed: ${failed}`);
            output.push(`⏭️  Skipped: ${skipped}`);
            output.push(`🔄 Retried: ${retriedTests.length}`);
            output.push(`⏱️  Total Duration: ${(totalDuration / 1000).toFixed(2)}s\n`);
            
            // Top 10 slowest tests
            output.push("🐌 TOP 10 SLOWEST TESTS:");
            output.push("-".repeat(80));
            sorted.slice(0, 10).forEach((profile, index) => {
                const icon = profile.status === "passed" ? "✅" : 
                            profile.status === "failed" ? "❌" : "⏭️";
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
                    .filter(p => p.status === "failed")
                    .forEach((profile) => {
                        const fileName = path.basename(profile.file);
                        output.push(`\n📁 ${fileName}`);
                        output.push(`   Test: ${profile.name}`);
                        output.push(`   Duration: ${(profile.duration / 1000).toFixed(2)}s`);
                        if (profile.retries > 0) {
                            output.push(`   Retries: ${profile.retries}`);
                        }
                        
                        // Enhanced error reporting
                        if (profile.errorDetails) {
                            if (profile.errorDetails.timeout) {
                                output.push(`   ⏱️  TIMEOUT ERROR`);
                            }
                            if (profile.errorDetails.line) {
                                output.push(`   📍 Failed at line ${profile.errorDetails.line}${profile.errorDetails.column ? `:${profile.errorDetails.column}` : ''}`);
                            }
                            if (profile.errorDetails.message) {
                                const errorMsg = profile.errorDetails.message.length > 300 
                                    ? profile.errorDetails.message.substring(0, 300) + "..."
                                    : profile.errorDetails.message;
                                output.push(`   Error: ${errorMsg}`);
                            }
                            // Show relevant stack trace lines (first 5 lines)
                            if (profile.errorDetails.stack) {
                                const stackLines = profile.errorDetails.stack.split('\n').slice(0, 6);
                                output.push(`   Stack:`);
                                stackLines.forEach(line => {
                                    if (line.trim()) {
                                        output.push(`      ${line.trim()}`);
                                    }
                                });
                            }
                        } else if (profile.error) {
                            const errorMsg = profile.error.length > 300 
                                ? profile.error.substring(0, 300) + "..."
                                : profile.error;
                            output.push(`   Error: ${errorMsg}`);
                        }
                    });
            }
            
            // Flaky tests (tests that needed retries but eventually passed)
            const flakyTests = this.profiles.filter(
                p => p.retries > 0 && p.status === "passed"
            );
            if (flakyTests.length > 0) {
                output.push("\n" + "=".repeat(80));
                output.push("⚠️  FLAKY TESTS (passed after retry):");
                output.push("-".repeat(80));
                flakyTests.forEach((profile) => {
                    const fileName = path.basename(profile.file);
                    output.push(`📁 ${fileName}`);
                    output.push(`   Test: ${profile.name}`);
                    output.push(`   Retries: ${profile.retries}`);
                    output.push(`   Duration: ${(profile.duration / 1000).toFixed(2)}s\n`);
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
            
            // Save detailed report to file in CI
            if (process.env.CI) {
                const report = {
                    summary: {
                        passed,
                        failed,
                        skipped,
                        totalTests: this.profiles.length,
                        retriedCount: retriedTests.length,
                        totalDuration,
                    },
                    slowestTests: sorted.slice(0, 20),
                    failedTests: this.profiles.filter(p => p.status === "failed"),
                    flakyTests: flakyTests,
                    allTests: this.profiles,
                };
                
                try {
                    await fs.writeFile(
                        "test-profile-report.json",
                        JSON.stringify(report, null, 2)
                    );
                    const saveMessage = "\n💾 Detailed profile saved to: test-profile-report.json\n";
                    process.stderr.write(saveMessage);
                    console.log(saveMessage);
                } catch (error) {
                    console.error("Failed to save profile report:", error);
                }
            }
        } catch (error) {
            console.error("Error in profiling reporter:", error);
        }
    }
}

