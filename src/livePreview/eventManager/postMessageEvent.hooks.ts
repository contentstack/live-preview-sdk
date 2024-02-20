import packageJson from "../../../package.json";
import Config, { setConfigFromParams } from "../../configManager/configManager";
import { ILivePreviewWindowType } from "../../types/types";
import livePreviewPostMessage from "./livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "./livePreviewEventManager.constant";
import {
    HistoryLivePreviewPostMessageEventData,
    LivePreviewInitEventResponse,
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

export function sendInitializeLivePreviewPostMessageEvent(): void {
    const config = Config.get();

    livePreviewPostMessage
        ?.send<LivePreviewInitEventResponse>(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            {
                config: {
                    shouldReload: config.ssr,
                    href: window.location.href,
                    sdkVersion: packageJson.version,
                },
            }
        )
        .then((data) => {
            const {
                contentTypeUid,
                entryUid,
                windowType = ILivePreviewWindowType.PREVIEW,
            } = data;

            if (contentTypeUid && entryUid) {
                // TODO: we should not use this function. Instead we should have sideEffect run automatically when we set the config.
                setConfigFromParams({
                    content_type_uid: contentTypeUid,
                    entry_uid: entryUid,
                });
            } else {
                // TODO: add debug logs that runs conditionally
                // PublicLogger.debug(
                //     "init message did not contain contentTypeUid or entryUid."
                // );
            }
            Config.set("windowType", windowType);

            // set timeout for client side (use to show warning: You are not editing this page)
            if (!config.ssr) {
                setInterval(() => {
                    sendCurrentPageUrlPostMessageEvent();
                }, 1500);
            }

            useHistoryPostMessageEvent();
            useOnEntryUpdatePostMessageEvent();
        })
        .catch((e) => {
            // TODO: add debug logs that runs conditionally
            // PublicLogger.debug("Error while sending init message", e);
        });
}

function sendCurrentPageUrlPostMessageEvent(): void {
    livePreviewPostMessage
        ?.send(LIVE_PREVIEW_POST_MESSAGE_EVENTS.CHECK_ENTRY_PAGE, {
            href: window.location.href,
        })
        .catch(() => {
            // TODO: add debug logs that runs conditionally
        });
}
