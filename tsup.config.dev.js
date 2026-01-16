import { defineConfig } from 'tsup'
import { modernConfig } from './tsup.config.js'

/**
 * Dev config: Optimized for faster development builds
 * - Skips type generation (dts: false) for faster compilation
 */
export default defineConfig([
    {
        ...modernConfig({
            entry: [
                "src/**/*.ts",
                "src/**/*.tsx",
                "!src/**/__test__",
                "!**/*.test.ts",
                "!**/*.test.tsx",
            ],
        }),
        dts: false
    },
])
