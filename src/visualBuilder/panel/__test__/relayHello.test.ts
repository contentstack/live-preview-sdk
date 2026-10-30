import Config from "../../../configManager/configManager";
import { askRelay } from "../relayHello";

const APP_ORIGIN = "https://app.contentstack.com";
const PANEL_URL = "https://visual-builder.contentstack.com/panel/index.html";

/** A real Window to stand in for the Visual Editor tab that opened this site. */
const makeOpener = () => {
    const frame = document.createElement("iframe");
    document.body.appendChild(frame);
    const opener = frame.contentWindow as Window;
    vi.spyOn(opener, "postMessage");
    Object.defineProperty(window, "opener", {
        value: opener,
        configurable: true,
    });
    return opener;
};

const reply = (source: Window, data: unknown, origin = APP_ORIGIN) =>
    window.dispatchEvent(new MessageEvent("message", { data, origin, source }));

const READY = {
    source: "cs-builder-relay",
    type: "ready",
    panelUrl: PANEL_URL,
};

describe("askRelay", () => {
    beforeEach(() => {
        vi.useFakeTimers();
        Config.set("stackDetails.apiKey", "blt_stack");
        Config.set("stackDetails.branch", "main");
    });

    afterEach(() => {
        vi.useRealTimers();
        Object.defineProperty(window, "opener", {
            value: null,
            configurable: true,
        });
        document.body.innerHTML = "";
        Config.reset();
    });

    test("answers null at once when no Visual Editor tab opened this site", async () => {
        await expect(askRelay()).resolves.toBeNull();
    });

    test("says hello with the stack and branch to the opener, pinned to the app origin", () => {
        const opener = makeOpener();

        void askRelay();

        expect(opener.postMessage).toHaveBeenCalledWith(
            {
                source: "cs-builder-panel",
                type: "hello",
                apiKey: "blt_stack",
                branch: "main",
            },
            APP_ORIGIN
        );
    });

    test("resolves the panel URL from the opener's ready reply", async () => {
        const opener = makeOpener();
        const answer = askRelay();

        reply(opener, READY);

        await expect(answer).resolves.toBe(PANEL_URL);
    });

    test("ignores a ready reply from another origin or another window", async () => {
        const opener = makeOpener();
        const answer = askRelay();

        reply(opener, READY, "https://evil.example");
        reply(window, READY);
        vi.advanceTimersByTime(3000);

        await expect(answer).resolves.toBeNull();
    });

    test("ignores a panel URL that is not http(s)", async () => {
        const opener = makeOpener();
        const answer = askRelay();

        reply(opener, { ...READY, panelUrl: "javascript:alert(1)" });
        vi.advanceTimersByTime(3000);

        await expect(answer).resolves.toBeNull();
    });

    test("gives up after 3 seconds without an answer", async () => {
        makeOpener();
        const answer = askRelay();

        vi.advanceTimersByTime(3000);

        await expect(answer).resolves.toBeNull();
    });
});
