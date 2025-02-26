interface UrlChangeData {
    url: string;
    path: string;
    search: string;
    type: "popstate" | "pushState" | "replaceState";
}

type UrlChangeCallback = (data: UrlChangeData) => void;

/**
 * Initializes a URL change listener that works with History API
 * @param callback Function to call when URL changes
 * @returns Function to remove the event listeners
 */
export function initUrlChangeListener(callback: UrlChangeCallback): () => void {
    let currentUrl = window.location.href;

    const createUrlData = (
        type: "popstate" | "pushState" | "replaceState"
    ): UrlChangeData => ({
        url: window.location.href,
        path: window.location.pathname,
        search: window.location.search,
        type,
    });

    // this handles cases like, pressing back and forward buttons in browser
    const handlePopState = () => {
        if (currentUrl !== window.location.href) {
            currentUrl = window.location.href;
            callback(createUrlData("popstate"));
        }
    };
    window.addEventListener("popstate", handlePopState);

    // monkey-patching history.pushState and history.replaceState
    const originalPushState = history.pushState;
    history.pushState = function (...args: any[]) {
        originalPushState.apply(this, args as any);
        currentUrl = window.location.href;
        callback(createUrlData("pushState"));
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = function (...args: any[]) {
        originalReplaceState.apply(this, args as any);
        currentUrl = window.location.href;
        callback(createUrlData("replaceState"));
    };

    // cleanup function
    return () => {
        window.removeEventListener("popstate", handlePopState);
        history.pushState = originalPushState;
        history.replaceState = originalReplaceState;
    };
}