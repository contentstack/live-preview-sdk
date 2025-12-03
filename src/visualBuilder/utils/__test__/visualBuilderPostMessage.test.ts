import { describe, it, expect, vi } from 'vitest';
import { EventManager } from "@contentstack/advanced-post-message";
import { VISUAL_BUILDER_CHANNEL_ID } from "../constants";


// Vitest 4: Use class-based mock for constructor
let constructorCalls: any[] = [];

vi.mock('@contentstack/advanced-post-message', () => {
    const mockInstance = {
        on: vi.fn(),
        send: vi.fn(),
    };
    
    // Initialize constructor calls array
    const calls: any[] = [];
    
    // Create a class that returns the mock instance
    class EventManagerClass {
        on = vi.fn();
        send = vi.fn();
        constructor(...args: any[]) {
            // Track constructor calls
            calls.push(args);
            // Return the shared instance for reference equality in tests
            return mockInstance;
        }
    }
    
    // Store references for use in tests
    (globalThis as any).__visualBuilderMockEventManagerInstance = mockInstance;
    (globalThis as any).__visualBuilderConstructorCalls = calls;
    
    return {
        EventManager: EventManagerClass
    };
});

describe('visualBuilderPostMessage', () => {
    beforeAll(() => {
        constructorCalls = (globalThis as any).__visualBuilderConstructorCalls || [];
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
        // Get fresh reference after module reset
        constructorCalls = (globalThis as any).__visualBuilderConstructorCalls || [];
        // Clear constructor calls
        if (constructorCalls) {
            constructorCalls.length = 0;
        }
        delete require.cache[require.resolve('../visualBuilderPostMessage.ts')];
    })
    it('should be undefined if window is undefined', async () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;
        // import module after deleting window
        const module = await import('../visualBuilderPostMessage');
        
        expect(module.default).toBeUndefined();
        global.window = originalWindow;
    });

    it('should initialize EventManager if window is defined', async () => {
        // Get fresh reference before importing
        constructorCalls = (globalThis as any).__visualBuilderConstructorCalls || [];
        const mockEventManagerInstance = (globalThis as any).__visualBuilderMockEventManagerInstance;
        const module = await import('../visualBuilderPostMessage');

        // Get fresh reference after import (in case module reset happened)
        constructorCalls = (globalThis as any).__visualBuilderConstructorCalls || [];
        expect(constructorCalls[0]).toEqual([
            VISUAL_BUILDER_CHANNEL_ID,
            {
                target: window.parent,
                debug: false,
            }
        ]);
        expect(module.default).toBe(mockEventManagerInstance);
    });
});