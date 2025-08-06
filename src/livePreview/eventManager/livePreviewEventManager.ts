import { EventManager } from "@contentstack/advanced-post-message";
import { getCommunicationTarget } from "../../common";
import { LIVE_PREVIEW_CHANNEL_ID } from "./livePreviewEventManager.constant";

let livePreviewPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    const target = getCommunicationTarget();
    
    if (target) {
        livePreviewPostMessage = new EventManager(LIVE_PREVIEW_CHANNEL_ID, {
            target,
            debug: false,
            suppressErrors: true
        });
    }
}

export default livePreviewPostMessage;
