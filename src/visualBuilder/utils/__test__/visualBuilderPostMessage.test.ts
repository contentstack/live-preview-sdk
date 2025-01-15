import { describe, it, expect, vi } from 'vitest';
import { EventManager } from "@contentstack/advanced-post-message";
import { VISUAL_BUILDER_CHANNEL_ID } from "../constants";


vi.mock('@contentstack/advanced-post-message', () => {
    return {
        EventManager: vi.fn()
    };
});

describe('visualBuilderPostMessage', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
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
        const mockEventManagerInstance = {};
        EventManager.mockImplementation(() => mockEventManagerInstance);
        const module = await import('../visualBuilderPostMessage');

        expect(EventManager).toHaveBeenCalledWith(VISUAL_BUILDER_CHANNEL_ID, {
            target: window.parent,
            debug: false,
        });
        expect(module.default).toBe(mockEventManagerInstance);
    });
});