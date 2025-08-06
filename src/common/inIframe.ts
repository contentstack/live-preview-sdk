/**
 * Checks if the current window is running inside an iframe
 * @returns {boolean} true if inside iframe, false otherwise
 */
export function inIframe(): boolean {
    try {
        // If window.opener exists, we're in a new tab, not an iframe
        if (window.opener && window.opener !== window) {
            return false;
        }
        
        // Traditional iframe check
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}
