import { EventManager } from "@contentstack/advanced-post-message";
import { TIMELINE_CHANNEL_ID } from "./timelinePostMessage.constant";

let timelinePostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    timelinePostMessage = new EventManager(TIMELINE_CHANNEL_ID, {
        target: window.parent,
        debug: false,
    });
}

export default timelinePostMessage;
