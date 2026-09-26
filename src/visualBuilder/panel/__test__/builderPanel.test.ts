import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Config from "../../../configManager/configManager";
import {
    askRelay,
    mountPanel,
    openRelayAndDock,
    PANEL_ID,
    relayWindowName,
} from "../builderPanel";

vi.mock("../../../configManager/configManager");

const APP = "https://app.contentstack.example";
const PANEL = "https://panel.contentstack.example/panel/index.html";

function fakeRelay() {
    return { postMessage: vi.fn() } as unknown as Window & {
        postMessage: ReturnType<typeof vi.fn>;
    };
}

function dispatch(init: MessageEventInit) {
    window.dispatchEvent(new MessageEvent("message", init));
}

function ready(relay: Window, data: Record<string, unknown>, origin = APP) {
    dispatch({
        source: relay,
        origin,
        data: { source: "cs-builder-relay", type: "ready", ...data },
    });
}

describe("builderPanel", () => {
    beforeEach(() => {
        vi.mocked(Config.get).mockReturnValue({
            stackDetails: { branch: "main", apiKey: "blt1", locale: "en-us" },
            clientUrlParams: { url: APP },
        } as any);
    });

    afterEach(() => {
        document.getElementById(PANEL_ID)?.remove();
    });

    describe("askRelay", () => {
        it("asks the relay pinned to the app origin", () => {
            const relay = fakeRelay();
            askRelay(relay, 20);
            expect(relay.postMessage).toHaveBeenCalledWith(
                { source: "cs-builder-panel", type: "hello" },
                APP
            );
        });

        it("resolves the panel URL when the relay allows docking", async () => {
            const relay = fakeRelay();
            const answer = askRelay(relay, 500);
            ready(relay, { panelAllowed: true, panelUrl: PANEL });
            expect(await answer).toBe(PANEL);
        });

        it("resolves null when the relay says no", async () => {
            const relay = fakeRelay();
            const answer = askRelay(relay, 500);
            ready(relay, { panelAllowed: false });
            expect(await answer).toBeNull();
        });

        it("ignores an answer from another origin or window", async () => {
            const relay = fakeRelay();
            const answer = askRelay(relay, 50);
            ready(
                relay,
                { panelAllowed: true, panelUrl: PANEL },
                "https://evil.example"
            );
            ready(fakeRelay(), { panelAllowed: true, panelUrl: PANEL });
            expect(await answer).toBeNull();
        });
    });

    describe("mountPanel", () => {
        function loaded(panel: Window | null, origin: string, nonce = "n1") {
            dispatch({
                source: panel,
                origin,
                data: { source: "cs-builder-panel", type: "loaded", nonce },
            });
        }

        it("introduces the panel to the relay without touching the port", async () => {
            const relay = fakeRelay();
            const mounted = mountPanel(PANEL, relay, 500);
            const iframe = document.querySelector<HTMLIFrameElement>(
                `#${PANEL_ID} iframe`
            )!;
            expect(iframe.src).toContain("branch=main");
            const panel = iframe.contentWindow!;
            const panelPost = vi.spyOn(panel, "postMessage");

            loaded(panel, new URL(PANEL).origin);

            expect(await mounted).toBe(panel);
            expect(panelPost).toHaveBeenCalledWith(
                { source: "cs-builder-panel", type: "host-hello" },
                new URL(PANEL).origin
            );
            const [message, targetOrigin, transfer] =
                relay.postMessage.mock.calls[0];
            expect(message).toEqual({
                source: "cs-builder-panel",
                type: "connect",
                frameIndex: 0,
                nonce: "n1",
            });
            expect(targetOrigin).toBe(APP);
            expect(transfer).toBeUndefined();
        });

        it("ignores a loaded message from another origin, and cleans up", async () => {
            const relay = fakeRelay();
            const mounted = mountPanel(PANEL, relay, 50);
            const panel = document.querySelector<HTMLIFrameElement>(
                `#${PANEL_ID} iframe`
            )!.contentWindow;
            loaded(panel, "https://evil.example");
            expect(await mounted).toBeNull();
            expect(relay.postMessage).not.toHaveBeenCalled();
            expect(document.getElementById(PANEL_ID)).toBeNull();
        });
    });

    describe("openRelayAndDock", () => {
        afterEach(() => vi.restoreAllMocks());

        it("opens Visual Editor in a relay tab named for this stack and site", () => {
            const relay = fakeRelay();
            const open = vi.spyOn(window, "open").mockReturnValue(relay);
            expect(openRelayAndDock(`${APP}/#!/stack/blt1/visual-editor`)).toBe(
                true
            );
            expect(open).toHaveBeenCalledWith(
                `${APP}/#!/stack/blt1/visual-editor`,
                `csBuilderRelay:blt1:${window.location.origin}`
            );
            expect(relayWindowName()).toBe(
                `csBuilderRelay:blt1:${window.location.origin}`
            );
            // It asks the new tab whether to dock.
            expect(relay.postMessage).toHaveBeenCalledWith(
                { source: "cs-builder-panel", type: "hello" },
                APP
            );
        });

        it("reports a refused window so the caller can fall back", () => {
            vi.spyOn(window, "open").mockReturnValue(null);
            expect(openRelayAndDock(APP)).toBe(false);
        });
    });
});
