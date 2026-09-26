import Config from "../../configManager/configManager";
import { buildVisualBuilderSearchParams } from "../utils/getVisualBuilderRedirectionUrl";

/**
 * Docks Visual Builder as a panel in this page, for sites that cannot be framed.
 *
 * The site stays the top-level page and Visual Builder is the frame. The panel
 * holds no session; the Visual Builder tab that opened this page is the relay
 * that does. This page only introduces the two: the relay mints the port and
 * hands it to the panel directly, so this page never holds the channel.
 *
 * Nothing here decides whether a stack may dock. The relay answers that.
 */

const PANEL_SOURCE = "cs-builder-panel";
const RELAY_SOURCE = "cs-builder-relay";
export const PANEL_ID = "cs-builder-panel";

/** 72px rail + 400px form, the width Visual Builder's side form is built for. */
const DOCK_WIDTH = "472px";
const HELLO_INTERVAL_MS = 300;
const RELAY_TIMEOUT_MS = 10000;
const PANEL_TIMEOUT_MS = 20000;

function appOrigin(): string {
    return new URL(Config.get().clientUrlParams.url).origin;
}

/**
 * Asks `relay` whether this stack may dock. Resolves the panel URL, or null for
 * no, for an unreachable relay, or for a Visual Builder that predates docking.
 *
 * Polls, because the relay only answers once it has loaded its stack.
 */
export function askRelay(
    relay: Window,
    timeoutMs = RELAY_TIMEOUT_MS
): Promise<string | null> {
    const origin = appOrigin();
    return new Promise((resolve) => {
        const done = (panelUrl: string | null) => {
            window.clearInterval(poll);
            window.clearTimeout(timer);
            window.removeEventListener("message", onMessage);
            resolve(panelUrl);
        };
        const onMessage = (event: MessageEvent) => {
            const data = event.data;
            if (event.source !== relay || event.origin !== origin) return;
            if (data?.source !== RELAY_SOURCE || data.type !== "ready") return;
            done(data.panelAllowed && data.panelUrl ? data.panelUrl : null);
        };
        const hello = () => {
            try {
                relay.postMessage(
                    { source: PANEL_SOURCE, type: "hello" },
                    origin
                );
            } catch (e) {
                // Still loading; the next tick gets through.
            }
        };
        window.addEventListener("message", onMessage);
        const poll = window.setInterval(hello, HELLO_INTERVAL_MS);
        const timer = window.setTimeout(() => done(null), timeoutMs);
        hello();
    });
}

function frameIndexOf(win: Window): number {
    for (let i = 0; i < window.frames.length; i++) {
        if (window.frames[i] === win) return i;
    }
    return -1;
}

/**
 * Inserts the panel and introduces it to `relay`. Resolves the panel window, or
 * null if the panel never loaded, in which case nothing is left on the page.
 */
export function mountPanel(
    panelUrl: string,
    relay: Window,
    timeoutMs = PANEL_TIMEOUT_MS
): Promise<Window | null> {
    const url = new URL(panelUrl);
    url.search = buildVisualBuilderSearchParams().toString();
    const panelOrigin = url.origin;

    const container = document.createElement("div");
    container.id = PANEL_ID;
    // Inline: the site ships none of our CSS, and its z-indexes are unknown.
    Object.assign(container.style, {
        position: "fixed",
        top: "0",
        right: "0",
        width: DOCK_WIDTH,
        height: "100vh",
        zIndex: "2147483000",
    });
    const iframe = document.createElement("iframe");
    iframe.title = "Contentstack Visual Builder";
    Object.assign(iframe.style, {
        width: "100%",
        height: "100%",
        border: "0",
        display: "block",
    });
    container.appendChild(iframe);

    return new Promise((resolve) => {
        const done = (panel: Window | null) => {
            window.clearTimeout(timer);
            window.removeEventListener("message", onMessage);
            if (!panel) container.remove();
            resolve(panel);
        };
        const onMessage = (event: MessageEvent) => {
            const panel = iframe.contentWindow;
            const { source, type, nonce } = event.data ?? {};
            if (!panel || event.source !== panel) return;
            if (event.origin !== panelOrigin) return;
            if (source !== PANEL_SOURCE || type !== "loaded") return;
            if (typeof nonce !== "string") return;

            panel.postMessage(
                { source: PANEL_SOURCE, type: "host-hello" },
                panelOrigin
            );
            relay.postMessage(
                {
                    source: PANEL_SOURCE,
                    type: "connect",
                    frameIndex: frameIndexOf(panel),
                    nonce,
                },
                appOrigin()
            );
            done(panel);
        };
        window.addEventListener("message", onMessage);
        const timer = window.setTimeout(() => done(null), timeoutMs);
        iframe.src = url.toString();
        document.body.appendChild(container);
    });
}

/**
 * Docks the panel when the Visual Builder tab that opened this page allows it.
 * Otherwise does nothing, so the page behaves exactly as it does today.
 */
export async function dockFromOpener(): Promise<Window | null> {
    const relay = window.opener as Window | null;
    if (!relay || document.getElementById(PANEL_ID)) return null;
    const panelUrl = await askRelay(relay);
    if (!panelUrl) return null;
    return mountPanel(panelUrl, relay);
}
