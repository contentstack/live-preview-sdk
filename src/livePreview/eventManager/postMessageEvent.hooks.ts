import Config, { setConfigFromParams } from "../../configManager/configManager";
import { ILivePreviewWindowType } from "../../types/types";
import { VisualBuilder } from "../../visualBuilder";
import { visualBuilderStyles } from "../../visualBuilder/visualBuilder.style";
import livePreviewPostMessage from "./livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "./livePreviewEventManager.constant";
import {
    HistoryLivePreviewPostMessageEventData,
    LivePreviewInitEventResponse,
    OnAudienceModeVariantPatchUpdate,
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

/**
 * Registers a post message event listener for updating the variant / base classes in the live preview for audience mode.
 */
export function useRecalculateVariantDataCSLPValues(): void {
    livePreviewPostMessage?.on<OnAudienceModeVariantPatchUpdate>(
        LIVE_PREVIEW_POST_MESSAGE_EVENTS.VARIANT_PATCH,
        (event) => {
            if (VisualBuilder.VisualBuilderGlobalState.value.audienceMode) {
                console.log(
                    "updated value VARIANT_PATCH",
                    "audmode",
                    VisualBuilder.VisualBuilderGlobalState.value.audienceMode,
                    { expectedCSLPValues: event.data.expectedCSLPValues }
                );
                recalculateVariantClasses(event.data.expectedCSLPValues);
            }
        }
    );
}

function recalculateVariantClasses(
    expectedCSLPValues: OnAudienceModeVariantPatchUpdate["expectedCSLPValues"]
): void {
    const variantElement = document.querySelector(
        `[data-cslp="${expectedCSLPValues.variant}"]`
    );
    if (variantElement) {
        console.log("Element found:", variantElement);
    } else {
        console.log("Element not found.");
    }
    // const elements = document.querySelectorAll("[data-cslp]");
    // const observer = new MutationObserver((mutations, obs) => {
    //     mutations.forEach((mutation) => {
    //         if (
    //             mutation.type === "attributes" &&
    //             mutation.attributeName === "data-cslp"
    //         ) {
    //             const element = mutation.target as HTMLElement;
    //             const dataCslp = element.getAttribute("data-cslp");
    //             if (!dataCslp) return;
    //             if (
    //                 dataCslp.startsWith("v2:") &&
    //                 element.classList.contains("visual-builder__base-field")
    //             ) {
    //                 element.classList.remove(
    //                     visualBuilderStyles()["visual-builder__base-field"],
    //                     "visual-builder__base-field"
    //                 );
    //             }
    //             obs.disconnect();
    //         }
    //     });
    // });
}

export function sendInitializeLivePreviewPostMessageEvent(): void {
    livePreviewPostMessage
        ?.send<LivePreviewInitEventResponse>(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            {
                config: {
                    shouldReload: Config.get().ssr,
                    href: window.location.href,
                    sdkVersion: process.env.PACKAGE_VERSION,
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
