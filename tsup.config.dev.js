import { defineConfig } from 'tsup'
import { modernConfig } from './tsup.config.js'

export default defineConfig([
    {
        ...modernConfig({
            entry: ["src/**/*.ts","src/**/*.tsx", "!src/**/__test__", "!**/*.test.ts","!**/*.test.tsx"],
        }),
        dts: false
    },
])
