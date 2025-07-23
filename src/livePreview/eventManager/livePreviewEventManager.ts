import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_PREVIEW_CHANNEL_ID } from "./livePreviewEventManager.constant";

let livePreviewPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    let eventOptions = {
        target: window.parent,
        debug: false,
        suppressErrors: true
    };

    if (window.opener) {
        eventOptions.target = window.opener;
    }

    livePreviewPostMessage = new EventManager(LIVE_PREVIEW_CHANNEL_ID, eventOptions);
}

export default livePreviewPostMessage;
