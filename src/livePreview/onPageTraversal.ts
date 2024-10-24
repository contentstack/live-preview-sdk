import livePreviewPostMessage from "./eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "./eventManager/livePreviewEventManager.constant";

export function handlePageTraversal(): void {
    window.addEventListener("unload", () => {
        const targetURL = (document.activeElement as HTMLAnchorElement).href;
        if (targetURL) {
            livePreviewPostMessage?.send(
                LIVE_PREVIEW_POST_MESSAGE_EVENTS.URL_CHANGE,
                {
                    targetURL,
                }
            );
        }
    });
}
