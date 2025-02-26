import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initUrlChangeListener } from '../initUrlChangeListner';

describe('initUrlChangeListener', () => {
    const originalWindow = { ...window };
    const mockCallback = vi.fn();

    beforeEach(() => {
        mockCallback.mockReset();
        
        const mockLocation = new URL('https://contentstack.com');
        Object.defineProperty(window, 'location', {
            value: mockLocation,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'location', {
            value: originalWindow.location,
        });
    });

    it('should handle popstate events', () => {
        const cleanup = initUrlChangeListener(mockCallback);
        
        window.location.href = 'https://contentstack.com/new-page';
        window.dispatchEvent(new PopStateEvent('popstate'));

        expect(mockCallback).toHaveBeenCalledWith({
            url: 'https://contentstack.com/new-page',
            path: '/new-page',
            search: '',
            type: 'popstate',
        });

        cleanup();
    });

    it('should handle pushState', () => {
        const cleanup = initUrlChangeListener(mockCallback);
        
        history.pushState({}, '', '/new-route');

        expect(mockCallback).toHaveBeenCalledWith({
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
            type: 'pushState',
        });

        cleanup();
    });

    it('should handle replaceState', () => {
        const cleanup = initUrlChangeListener(mockCallback);
        
        history.replaceState({}, '', '/replaced-route');

        expect(mockCallback).toHaveBeenCalledWith({
            url: window.location.href,
            path: window.location.pathname,
            search: window.location.search,
            type: 'replaceState',
        });

        cleanup();
    });

    it('should cleanup properly', () => {
        const cleanup = initUrlChangeListener(mockCallback);
        cleanup();

        history.pushState({}, '', '/after-cleanup');
        expect(mockCallback).not.toHaveBeenCalled();

        history.replaceState({}, '', '/after-cleanup-replace');
        expect(mockCallback).not.toHaveBeenCalled();

        window.dispatchEvent(new PopStateEvent('popstate'));
        expect(mockCallback).not.toHaveBeenCalled();
    });
});
