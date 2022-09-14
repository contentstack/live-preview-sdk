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
        "^.+\\.(ts|tsx)$": "ts-jest",
    },
    coveragePathIgnorePatterns: ["__test__/"],
};
