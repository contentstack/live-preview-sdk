import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_PREVIEW_CHANNEL_ID } from "./livePreviewEventManager.constant";
import { inNewTab } from "../../common/inIframe";

let livePreviewPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    const eventOptions = {
        target: window.parent,
        debug: false,
        suppressErrors: true
    };

    if (inNewTab()) {
        eventOptions.target = window.opener;
    }

    livePreviewPostMessage = new EventManager(LIVE_PREVIEW_CHANNEL_ID, eventOptions);
}

export default livePreviewPostMessage;
