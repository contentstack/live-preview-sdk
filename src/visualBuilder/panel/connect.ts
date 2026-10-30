import Config from "../../configManager/configManager";

/**
 * Introduces the docked panel to this page and asks the Visual Editor tab to connect it.
 * The tab delivers its port straight to the panel frame, so this page never holds the channel.
 */
export function connectPanel(panel: HTMLIFrameElement): void {
    const panelOrigin = new URL(panel.src).origin;

    window.addEventListener("message", ({ data, source }: MessageEvent) => {
        const panelWindow = panel.contentWindow;
        if (
            !panelWindow ||
            source !== panelWindow ||
            data?.source !== "cs-builder-panel" ||
            data.type !== "loaded" ||
            typeof data.nonce !== "string"
        ) {
            return;
        }
        const relay = window.opener as Window | null;
        if (!relay) return;

        const { stackDetails, clientUrlParams } = Config.get();
        panelWindow.postMessage(
            { source: "cs-builder-panel", type: "host-hello" },
            panelOrigin
        );
        relay.postMessage(
            {
                source: "cs-builder-panel",
                type: "connect",
                apiKey: stackDetails.apiKey,
                branch: stackDetails.branch,
                frameIndex: frameIndexOf(panelWindow),
                nonce: data.nonce,
            },
            new URL(clientUrlParams.url).origin
        );
    });
}

/** The relay reaches the panel as `thisPage.frames[i]`. */
function frameIndexOf(frame: Window): number {
    for (let i = 0; i < window.frames.length; i++) {
        if (window.frames[i] === frame) return i;
    }
    return -1;
}
