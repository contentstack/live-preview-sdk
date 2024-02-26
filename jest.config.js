module.exports = {
    roots: ["<rootDir>/src"],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
    ],
    automock: false,
    setupFiles: ["<rootDir>/setupJest.ts"],
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.ts$": "ts-jest",
        "^.+\\.tsx$": "babel-jest",
    },
    coveragePathIgnorePatterns: ["__test__/"],
    collectCoverage: true,
    coverageReporters: ["html"],
    moduleNameMapper: {
        "^lodash-es$": "lodash",
    },
};
