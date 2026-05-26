import {
    vi,
    describe,
    it,
    expect,
    beforeEach,
    afterEach,
} from "vitest";
import { useScrollToHashAnchor } from "../useScrollToHashAnchor";

const setLocationHash = (hash: string) => {
    Object.defineProperty(window, "location", {
        writable: true,
        value: { ...window.location, hash, href: `http://localhost/${hash}` },
    });
};

describe("useScrollToHashAnchor", () => {
    let scrollSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        document.body.innerHTML = "";
        scrollSpy = vi.fn();
        // jsdom doesn't implement scrollIntoView.
        Element.prototype.scrollIntoView = scrollSpy as unknown as (
            arg?: boolean | ScrollIntoViewOptions
        ) => void;
        setLocationHash("");
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it("does nothing when there is no hash", () => {
        setLocationHash("");
        const el = document.createElement("div");
        el.id = "footer";
        document.body.appendChild(el);

        useScrollToHashAnchor();

        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it("ignores hash-router URLs starting with #/", () => {
        setLocationHash("#/dashboard");
        const el = document.createElement("div");
        el.id = "dashboard";
        document.body.appendChild(el);

        useScrollToHashAnchor();

        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it("ignores hashbang router URLs starting with #!/", () => {
        setLocationHash("#!/products");
        const el = document.createElement("div");
        el.id = "products";
        document.body.appendChild(el);

        useScrollToHashAnchor();

        expect(scrollSpy).not.toHaveBeenCalled();
    });

    it("scrolls immediately when the anchor element already exists", () => {
        setLocationHash("#footer");
        const el = document.createElement("div");
        el.id = "footer";
        document.body.appendChild(el);

        useScrollToHashAnchor();

        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy).toHaveBeenCalledWith({
            behavior: "smooth",
            block: "start",
        });
    });

    it("waits for the anchor element to appear via MutationObserver", () => {
        // jsdom's MutationObserver microtask flushing is unreliable in vitest,
        // so we stub it and trigger the callback manually.
        let observerCallback: MutationCallback | null = null;
        const disconnect = vi.fn();
        const observe = vi.fn();
        const OriginalMO = global.MutationObserver;
        class StubMutationObserver {
            constructor(cb: MutationCallback) {
                observerCallback = cb;
            }
            observe = observe;
            disconnect = disconnect;
            takeRecords = () => [];
        }
        global.MutationObserver =
            StubMutationObserver as unknown as typeof MutationObserver;

        try {
            setLocationHash("#footer");
            useScrollToHashAnchor();

            expect(scrollSpy).not.toHaveBeenCalled();
            expect(observe).toHaveBeenCalledTimes(1);

            // Element appears later (SPA hydration), observer fires.
            const el = document.createElement("div");
            el.id = "footer";
            document.body.appendChild(el);
            observerCallback?.([], {} as MutationObserver);

            expect(scrollSpy).toHaveBeenCalledTimes(1);
            expect(disconnect).toHaveBeenCalledTimes(1);
        } finally {
            global.MutationObserver = OriginalMO;
        }
    });

    it("falls back to elements queried by name attribute (legacy anchors)", () => {
        setLocationHash("#footer");
        const a = document.createElement("a");
        a.setAttribute("name", "footer");
        document.body.appendChild(a);

        useScrollToHashAnchor();

        expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    it("decodes percent-encoded ids before lookup", () => {
        setLocationHash("#contact%20us");
        const el = document.createElement("div");
        el.id = "contact us";
        document.body.appendChild(el);

        useScrollToHashAnchor();

        expect(scrollSpy).toHaveBeenCalledTimes(1);
    });

    it("stops observing after the timeout when the element never appears", async () => {
        vi.useFakeTimers();
        setLocationHash("#never");

        useScrollToHashAnchor();
        expect(scrollSpy).not.toHaveBeenCalled();

        // Past the 5s safety timeout — observer should disconnect.
        vi.advanceTimersByTime(6000);
        vi.useRealTimers();

        // Add the element after the timeout — observer is disconnected, so
        // no scroll should fire.
        const el = document.createElement("div");
        el.id = "never";
        document.body.appendChild(el);

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(scrollSpy).not.toHaveBeenCalled();
    });
});
