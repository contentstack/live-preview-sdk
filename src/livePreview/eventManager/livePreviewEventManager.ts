import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_PREVIEW_CHANNEL_ID } from "./livePreviewEventManager.constant";

let livePreviewPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    livePreviewPostMessage = new EventManager(LIVE_PREVIEW_CHANNEL_ID, {
        target: window.parent,
        debug: false,
    });
}

export default livePreviewPostMessage;
