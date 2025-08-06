import { EventManager } from "@contentstack/advanced-post-message";
import { getCommunicationTarget } from "../../common";
import { TIMELINE_CHANNEL_ID } from "./timelinePostMessage.constant";

let timelinePostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    const target = getCommunicationTarget();
    
    if (target) {
        timelinePostMessage = new EventManager(TIMELINE_CHANNEL_ID, {
            target,
            debug: false,
        });
    }
}

export default timelinePostMessage;
