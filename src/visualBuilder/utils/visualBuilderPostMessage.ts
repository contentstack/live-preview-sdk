import { EventManager } from "@contentstack/advanced-post-message";
import { getCommunicationTarget } from "../../common";
import { VISUAL_BUILDER_CHANNEL_ID } from "./constants";

let visualBuilderPostMessage: EventManager | undefined;

if (typeof window !== "undefined") {
    const target = getCommunicationTarget();
    
    if (target) {
        visualBuilderPostMessage = new EventManager(VISUAL_BUILDER_CHANNEL_ID, {
            target,
            debug: false,
            // suppressErrors: true,
        });
    }
}

export default visualBuilderPostMessage;
