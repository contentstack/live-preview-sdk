import Config from "../../../configManager/configManager";
import { connectPanel } from "../connect";

const APP_ORIGIN = "https://app.contentstack.com";
const PANEL_ORIGIN = "https://visual-builder.contentstack.com";
const PANEL_URL = `${PANEL_ORIGIN}/panel/index.html`;

describe("connectPanel", () => {
    let relay: Window;
    let panel: HTMLIFrameElement;
    let panelPost: ReturnType<typeof vi.spyOn>;

    const addFrame = () =>
        document.body.appendChild(document.createElement("iframe"));

    /** The panel announcing itself from its frame. */
    const loaded = (
        source: Window | null = panel.contentWindow,
        data: unknown = {
            source: "cs-builder-panel",
            type: "loaded",
            nonce: "nonce-1",
        }
    ) =>
        window.dispatchEvent(
            new MessageEvent("message", { data, origin: PANEL_ORIGIN, source })
        );

    beforeEach(() => {
        Config.set("stackDetails.apiKey", "blt_stack");
        Config.set("stackDetails.branch", "main");
        relay = addFrame().contentWindow as Window;
        vi.spyOn(relay, "postMessage").mockImplementation(() => {});
        Object.defineProperty(window, "opener", {
            value: relay,
            configurable: true,
        });
        panel = addFrame();
        panel.src = PANEL_URL;
        panelPost = vi
            .spyOn(panel.contentWindow as Window, "postMessage")
            .mockImplementation(() => {});
    });

    afterEach(() => {
        Object.defineProperty(window, "opener", {
            value: null,
            configurable: true,
        });
        document.body.innerHTML = "";
        vi.restoreAllMocks();
        Config.reset();
    });

    test("introduces the host to the panel, pinned to the panel's origin", () => {
        connectPanel(panel);

        loaded();

        expect(panelPost).toHaveBeenCalledWith(
            { source: "cs-builder-panel", type: "host-hello" },
            PANEL_ORIGIN
        );
    });

    test("asks the Visual Editor tab to connect the panel frame, pinned to the app origin", () => {
        connectPanel(panel);

        loaded();

        // The relay frame comes first in window.frames, so the panel is frame 1.
        expect(relay.postMessage).toHaveBeenCalledWith(
            {
                source: "cs-builder-panel",
                type: "connect",
                apiKey: "blt_stack",
                branch: "main",
                frameIndex: 1,
                nonce: "nonce-1",
            },
            APP_ORIGIN
        );
    });

    test("ignores a loaded message from any window but the panel's", () => {
        connectPanel(panel);

        loaded(window);
        loaded(addFrame().contentWindow);

        expect(panelPost).not.toHaveBeenCalled();
        expect(relay.postMessage).not.toHaveBeenCalled();
    });

    test("ignores a loaded message with no nonce", () => {
        connectPanel(panel);

        loaded(panel.contentWindow, {
            source: "cs-builder-panel",
            type: "loaded",
        });

        expect(relay.postMessage).not.toHaveBeenCalled();
    });

    test("connects again when the panel reloads with a new nonce", () => {
        connectPanel(panel);

        loaded();
        loaded(panel.contentWindow, {
            source: "cs-builder-panel",
            type: "loaded",
            nonce: "nonce-2",
        });

        expect(relay.postMessage).toHaveBeenCalledTimes(2);
        expect(vi.mocked(relay.postMessage).mock.calls[1][0]).toMatchObject({
            nonce: "nonce-2",
        });
    });
});
