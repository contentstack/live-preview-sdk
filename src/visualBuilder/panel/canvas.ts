import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";

/**
 * Makes this page the docked panel's canvas. The panel repeats "canvas-ready" until it has answered an init,
 * so each one re-points both channels at it and sends `init` again: a missed init or a reloaded panel recovers on its own.
 */
export function introducePageToPanel(
    panel: HTMLIFrameElement,
    init: () => Promise<unknown>
): void {
    const panelOrigin = new URL(panel.src).origin;
    let introducing = false;

    window.addEventListener(
        "message",
        ({ data, source, origin }: MessageEvent) => {
            const panelWindow = panel.contentWindow;
            if (
                introducing ||
                !panelWindow ||
                source !== panelWindow ||
                origin !== panelOrigin ||
                data?.source !== "cs-builder-panel" ||
                data.type !== "canvas-ready"
            ) {
                return;
            }
            introducing = true;
            const to = { target: panelWindow, targetOrigin: panelOrigin };
            visualBuilderPostMessage?.updateConfig(to);
            livePreviewPostMessage?.updateConfig(to);
            init()
                .catch(() => {})
                .finally(() => {
                    introducing = false;
                });
        }
    );
}
