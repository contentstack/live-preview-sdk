import { afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/preact";
import "@testing-library/jest-dom/vitest";
beforeAll(() => {
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        unobserve: vi.fn(),
        disconnect: vi.fn(),
    }));
    
    global.MutationObserver = vi.fn().mockImplementation(() => ({
        observe: vi.fn(),
        disconnect: vi.fn(),
    }));
})

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});
