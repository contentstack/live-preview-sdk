import Config from "../../configManager/configManager";

const HELLO_TIMEOUT_MS = 3000;

/**
 * Asks the Visual Editor tab that opened this site whether this stack and branch may dock,
 * and where the panel is served. Resolves null when no such tab answers.
 */
export function askRelay(): Promise<string | null> {
    const relay = window.opener as Window | null;
    if (!relay) return Promise.resolve(null);

    const { stackDetails, clientUrlParams } = Config.get();
    // Only the Contentstack app may answer; the opener could have navigated anywhere since.
    const appOrigin = new URL(clientUrlParams.url).origin;

    return new Promise((resolve) => {
        const done = (panelUrl: string | null) => {
            window.removeEventListener("message", onMessage);
            clearTimeout(timer);
            resolve(panelUrl);
        };
        const onMessage = ({ data, origin, source }: MessageEvent) => {
            if (
                source !== relay ||
                origin !== appOrigin ||
                data?.source !== "cs-builder-relay" ||
                data.type !== "ready" ||
                !isHttpUrl(data.panelUrl)
            ) {
                return;
            }
            done(data.panelUrl);
        };
        const timer = setTimeout(() => done(null), HELLO_TIMEOUT_MS);

        window.addEventListener("message", onMessage);
        relay.postMessage(
            {
                source: "cs-builder-panel",
                type: "hello",
                apiKey: stackDetails.apiKey,
                branch: stackDetails.branch,
            },
            appOrigin
        );
    });
}

function isHttpUrl(value: unknown): value is string {
    try {
        return ["https:", "http:"].includes(new URL(String(value)).protocol);
    } catch {
        return false;
    }
}
