import { vi } from "vitest";

/**
 * Vitest 4 requires globals used with `new` to be constructible (class or `function`);
 * `vi.fn().mockImplementation(() => ({ ... }))` is not a constructor and throws.
 */
class MockResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();

    constructor(_: ResizeObserverCallback) {}
}

class MockMutationObserver {
    observe = vi.fn();
    disconnect = vi.fn();
    takeRecords = vi.fn((): MutationRecord[] => []);

    constructor(_: MutationCallback) {}
}

export const constructibleResizeObserver =
    MockResizeObserver as unknown as typeof ResizeObserver;

export const constructibleMutationObserver =
    MockMutationObserver as unknown as typeof MutationObserver;

export function installGlobalObserverMocks() {
    global.ResizeObserver = constructibleResizeObserver;
    global.MutationObserver = constructibleMutationObserver;
}
