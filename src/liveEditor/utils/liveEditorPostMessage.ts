import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_EDITOR_CHANNEL_ID } from "./constants";

let liveEditorPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    liveEditorPostMessage = new EventManager(LIVE_EDITOR_CHANNEL_ID, {
        target: window.parent,
        debug: false,
    });
}

export default liveEditorPostMessage;
