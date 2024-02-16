import Config, { setConfigFromParams } from "../../configManager/configManager";
import livePreviewPostMessage from "./livePreviewEventManager";

import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "./livePreviewEventManger.constant";
import {
    HistoryLivePreviewPostMessageEventData,
    OnChangeLivePreviewPostMessageEventData,
} from "./types/livePreviewPostMessageEvent.type";

/**
 * Registers a post message event listener for history-related events.
 * The listener handles events for forward, backward, and reload actions on the browser history.
 */
export function useHistoryPostMessageEvent(): void {
    livePreviewPostMessage?.on<HistoryLivePreviewPostMessageEventData>(
        LIVE_PREVIEW_POST_MESSAGE_EVENTS.HISTORY,
        (event) => {
            switch (event.data.type) {
                case "forward": {
                    window.history.forward();
                    break;
                }
                case "backward": {
                    window.history.back();
                    break;
                }
                case "reload": {
                    window.history.go();
                    break;
                }
                default: {
                    const exhaustiveCheck: never = event.data.type;
                    throw new Error(`Unhandled event: ${exhaustiveCheck}`);
                }
            }
        }
    );
}

/**
 * Registers a post message event listener for updating the entry in the live preview.
 */
export function useOnEntryUpdatePostMessageEvent(): void {
    livePreviewPostMessage?.on<OnChangeLivePreviewPostMessageEventData>(
        LIVE_PREVIEW_POST_MESSAGE_EVENTS.ON_CHANGE,
        (event) => {
            const config = Config.get();

            setConfigFromParams({
                live_preview: event.data.hash,
            });

            if (!config.ssr) {
                const config = Config.get();
                config.onChange();
            }
        }
    );
}
