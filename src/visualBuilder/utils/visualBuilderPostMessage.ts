import { EventManager } from "@contentstack/advanced-post-message";
import { LIVE_EDITOR_CHANNEL_ID } from "./constants";

let visualBuilderPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    visualBuilderPostMessage = new EventManager(LIVE_EDITOR_CHANNEL_ID, {
        target: window.parent,
        debug: false,
        // suppressErrors: true,
    });
}

export default visualBuilderPostMessage;
