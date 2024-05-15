export default {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src"],
    testMatch: [
        "**/__tests__/**/*.+(ts|tsx|js)",
        "**/?(*.)+(spec|test).+(ts|tsx|js)",
    ],
    automock: false,
    setupFiles: ["<rootDir>/setupJest.ts"],
    transform: {
        "^.+\\.(ts|tsx)$": 'ts-jest',
    },
    coveragePathIgnorePatterns: ["__test__/"],
    "collectCoverage": true,
    "coverageReporters": ["html"],
};
