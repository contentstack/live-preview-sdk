import Config, { setConfigFromParams } from "../../configManager/configManager";
import { ILivePreviewWindowType } from "../../types/types";
import { addParamsToUrl } from "../../utils";
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
            setConfigFromParams({
                live_preview: event.data.hash,
            });
            const { ssr, onChange } = Config.get();
            if (!ssr) {
                onChange();
            }
        }
    );
}

export function sendInitializeLivePreviewPostMessageEvent(): void {
    livePreviewPostMessage
        ?.send<LivePreviewInitEventResponse>(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            {
                config: {
                    shouldReload: Config.get().ssr,
                    href: window.location.href,
                    sdkVersion: process?.env?.PACKAGE_VERSION,
                    mode: Config.get().mode,
                },
            }
        )
        .then((data) => {
            const {
                contentTypeUid,
                entryUid,
                windowType = ILivePreviewWindowType.PREVIEW,
            } = data || {};

            // TODO: This is a fix for the issue where we were calling sending init in the builder
            // Let's remove this condition when we fix it.
            if (Config?.get()?.windowType && Config.get().windowType === ILivePreviewWindowType.BUILDER) {
                return;
            }

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
            if (Config.get().ssr) {
                addParamsToUrl();
            }
            Config.set("windowType", windowType);

            // set timeout for client side (use to show warning: You are not editing this page)
            if (!Config.get().ssr) {
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
