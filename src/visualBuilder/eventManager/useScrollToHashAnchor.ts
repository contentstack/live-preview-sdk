const SCROLL_TIMEOUT_MS = 5000;

const findAnchor = (id: string): HTMLElement | null => {
    const byId = document.getElementById(id);
    if (byId) return byId;
    try {
        return document.querySelector<HTMLElement>(
            `[name="${CSS.escape(id)}"]`
        );
    } catch {
        return null;
    }
};

export const useScrollToHashAnchor = (): void => {
    const rawHash = window.location.hash;
    if (!rawHash || rawHash.length < 2) return;
    // Hash-router URLs (#/route, #!/route) are routes, not anchors.
    if (rawHash.startsWith("#/") || rawHash.startsWith("#!/")) return;

    let id: string;
    try {
        id = decodeURIComponent(rawHash.slice(1));
    } catch {
        id = rawHash.slice(1);
    }
    if (!id) return;

    const scrollTo = (el: HTMLElement) => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const existing = findAnchor(id);
    if (existing) {
        scrollTo(existing);
        return;
    }

    // User site may be an SPA — wait for the element to appear in the DOM.
    const observer = new MutationObserver(() => {
        const el = findAnchor(id);
        if (el) {
            observer.disconnect();
            clearTimeout(timeoutId);
            scrollTo(el);
        }
    });

    const timeoutId = window.setTimeout(() => {
        observer.disconnect();
    }, SCROLL_TIMEOUT_MS);

    observer.observe(document.body, { childList: true, subtree: true });
};
