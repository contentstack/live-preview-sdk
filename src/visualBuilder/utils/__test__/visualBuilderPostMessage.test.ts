import { describe, it, expect, vi } from 'vitest';
import { EventManager } from "@contentstack/advanced-post-message";
import { VISUAL_BUILDER_CHANNEL_ID } from "../constants";

// Mock EventManager as a proper class for Vitest v4
class MockEventManager {
    on = vi.fn();
    send = vi.fn();
    constructor(channelId: string, options: any) {
        // Store constructor args for assertions
        (MockEventManager as any).lastChannelId = channelId;
        (MockEventManager as any).lastOptions = options;
    }
}

vi.mock('@contentstack/advanced-post-message', () => {
    return {
        EventManager: MockEventManager
    };
});

describe('visualBuilderPostMessage', () => {
    beforeEach(() => {
        // Reset MockEventManager constructor tracking
        (MockEventManager as any).lastChannelId = undefined;
        (MockEventManager as any).lastOptions = undefined;
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

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
        const module = await import('../visualBuilderPostMessage');

        expect((MockEventManager as any).lastChannelId).toBe(VISUAL_BUILDER_CHANNEL_ID);
        expect((MockEventManager as any).lastOptions).toEqual({
            target: window.parent,
            debug: false,
        });
        expect(module.default).toBeInstanceOf(MockEventManager);
    });
});