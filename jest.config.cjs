module.exports = {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
    ],
    automock: false,
    setupFiles: ["<rootDir>/setupJest.ts"],
    preset: "ts-jest",
    moduleNameMapper: {
        uuid: require.resolve("uuid"),
    },
    coveragePathIgnorePatterns: ["__test__/"],
    collectCoverage: true,
    coverageReporters: ["html"],
};
