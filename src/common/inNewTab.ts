/**
 * Checks if the current window was opened in a new tab/window via window.open()
 * @returns {boolean} true if opened via window.opener, false otherwise
 */
export function inNewTab(): boolean {
    try {
        return !!(typeof window !== "undefined" && window.opener && window.opener !== window);
    } catch (e) {
        return false;
    }
}

/**
 * Gets the communication target - either parent window (iframe) or opener window (new tab)
 * @returns {Window | null} The target window for postMessage communication
 */
export function getCommunicationTarget(): Window | null {
    try {
        if (typeof window === "undefined") {
            return null;
        }
        
        // Prioritize opener for new tab communication
        if (window.opener && window.opener !== window) {
            return window.opener;
        }
        
        // Fallback to parent for iframe communication
        if (window.parent && window.parent !== window) {
            return window.parent;
        }
        
        return null;
    } catch (e) {
        return null;
    }
} 