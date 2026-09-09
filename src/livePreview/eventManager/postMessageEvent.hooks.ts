import { inVisualEditor, isOpeningInNewTab } from "../../common/inIframe";
import Config, { syncToStackSdk } from "../../configManager/configManager";
import { PublicLogger } from "../../logger/logger";
import { ILivePreviewWindowType } from "../../types/types";
import { addParamsToUrl, isOpeningInTimeline } from "../../utils";
import { isPanelOpen } from "../../visualBuilder/panel/panelElement";

/**
 * Whether this document is the canvas *and* the top-level page — the live-preview
 * popout, or a page with the builder docked into it. Either way nothing else can
 * set our URL for us, so we keep the preview params on it ourselves.
 */
function isTopLevelCanvas(): boolean {
    return isOpeningInNewTab() || isPanelOpen();
}

/**
 * The tracker this document's markup was rendered against, captured at load.
 *
 * Deliberately captured here rather than read from the live URL: we rewrite the
 * URL in place to keep the preview params current, so by the time an SSR reload
 * decision is made the URL no longer says what the markup was built from.
 * A soft reload refreshes the markup without producing a new document, so it
 * updates this in place — otherwise every later ON_CHANGE would look like a
 * reason to reload again.
 */
const documentRenderedHash =
    typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("live_preview")
        : null;
import livePreviewPostMessage from "./livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "./livePreviewEventManager.constant";
import {
    HistoryLivePreviewPostMessageEventData,
    LivePreviewInitEventResponse,
    OnChangeLivePreviewPostMessageEventData,
    OnChangeLivePreviewPostMessageEventTypes,
} from "./types/livePreviewPostMessageEvent.type";

/**
 * Registers a post message event listener for history-related events.
 * The listener handles events for forward, backward, and reload actions on the browser history.
 */
/**
 * Whether the page may navigate itself to pick up new content.
 *
 * A server-rendered canvas can only show an edit by being fetched again, so the
 * builder reloads it. While developing that is disruptive: the reload fires on
 * every blur after an edit, and with the builder docked into this page it takes
 * the panel down and back up each time. `cs_manual_reload=true` on the URL turns
 * the automatic reloads off and leaves the browser's own reload button as the
 * way to refresh, which is what a developer wants while poking at the panel.
 *
 * Deliberately a URL param rather than a build flag: it has to be switchable on
 * a running site, it survives the reloads it governs, and it needs no rebuild.
 */
function autoReloadDisabled(): boolean {
    try {
        return (
            new URLSearchParams(window.location.search).get(
                "cs_manual_reload"
            ) === "true"
        );
    } catch (e) {
        return false;
    }
}

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
                    if (autoReloadDisabled()) {
                        PublicLogger.debug(
                            "[Visual Builder] reload suppressed by cs_manual_reload; use the browser reload to refresh."
                        );
                        break;
                    }
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
            try {
                const { ssr, onChange, stackDetails } = Config.get();
                const event_type = event.data._metadata?.event_type;
                // hash is typed as required string, guard is a safety net
                if (event.data.hash) {
                    Config.set("hash", event.data.hash);
                    syncToStackSdk({ hash: event.data.hash });
                }

                // The preview API rejects a live_preview hash that arrives
                // without the entry it belongs to. When the canvas is an iframe,
                // Visual Builder puts all three on the URL it loads and the SDK
                // picks them up from there. A top-level canvas has no such URL,
                // so take them from the payload instead — otherwise the first
                // edit turns every content request into a 400 and the site falls
                // through to its own not-found page.
                const contentTypeUid = event.data.content_type_uid;
                const entryUid = event.data.entry_uid;
                if (contentTypeUid && entryUid) {
                    Config.set("stackDetails.contentTypeUid", contentTypeUid);
                    Config.set("stackDetails.entryUid", entryUid);
                    syncToStackSdk({ contentTypeUid, entryUid });
                }

                // This section will run when there is a change in the entry and the website is CSR
                if (!ssr && !event_type) {
                    onChange();
                }

                // A top-level canvas owns its own URL, so it has to carry the
                // preview params itself. True of the live-preview popout and of a
                // page with the builder docked into it — in both cases there is no
                // parent frame whose src someone else can set.
                if (isTopLevelCanvas()) {
                    if (!window) {
                        PublicLogger.error("window is not defined");
                        return;
                    }

                    // Kept on the URL for every render mode, not just SSR, so a
                    // top-level canvas looks like the framed one: Visual Builder
                    // always puts all three on a canvas iframe's src. It also means
                    // a reload or a shared link comes back to the same preview.
                    const url = new URL(window.location.href);
                    const nextHash = event.data.hash;
                    const nextContentTypeUid =
                        event.data.content_type_uid ||
                        stackDetails.contentTypeUid?.toString() ||
                        "";
                    const nextEntryUid =
                        event.data.entry_uid ||
                        stackDetails.entryUid?.toString() ||
                        "";

                    if (nextHash)
                        url.searchParams.set("live_preview", nextHash);
                    if (nextContentTypeUid) {
                        url.searchParams.set(
                            "content_type_uid",
                            nextContentTypeUid
                        );
                    }
                    if (nextEntryUid) {
                        url.searchParams.set("entry_uid", nextEntryUid);
                    }

                    // A URL change is a navigation, so it wins over any param sync.
                    if (
                        event_type ===
                            OnChangeLivePreviewPostMessageEventTypes.URL_CHANGE &&
                        event.data.url
                    ) {
                        // Only the path is trustworthy: the sender resolves URLs
                        // against the host it was configured with, which for a
                        // docked builder is not where this page lives. And the
                        // preview params ride along — `url` already carries the
                        // new tracker and entry — so the destination comes back
                        // editing rather than as the plain site.
                        const requested = new URL(
                            event.data.url,
                            window.location.href
                        );
                        const target = new URL(
                            requested.pathname +
                                requested.search +
                                requested.hash,
                            window.location.origin
                        );
                        url.searchParams.forEach((value, key) => {
                            if (!target.searchParams.has(key)) {
                                target.searchParams.set(key, value);
                            }
                        });
                        window.location.href = target.toString();
                        return;
                    }

                    // Server-rendered markup can only pick up new content by being
                    // fetched again, and only when the tracker actually differs from
                    // the one this document was rendered against. Comparing against
                    // the hash captured at load — rather than the live URL, which we
                    // have just rewritten — is what stops an endless
                    // reload / remount / re-announce cycle.
                    if (
                        ssr &&
                        !event_type &&
                        nextHash &&
                        nextHash !== documentRenderedHash
                    ) {
                        if (autoReloadDisabled()) {
                            // Keep the params on the URL so a manual reload
                            // still lands on the right entry and tracker.
                            window.history.replaceState(
                                {},
                                "",
                                url.toString()
                            );
                            PublicLogger.debug(
                                "[Visual Builder] reload suppressed by cs_manual_reload; use the browser reload to refresh."
                            );
                            return;
                        }
                        window.location.href = url.toString();
                        return;
                    }

                    if (url.toString() !== window.location.href) {
                        window.history.replaceState({}, "", url.toString());
                    }
                }
            } catch (error) {
                PublicLogger.error(
                    "Error handling live preview update:",
                    error
                );
                return;
            }
        }
    );
}

export function sendInitializeLivePreviewPostMessageEvent(): void {
    const config = Config.get();
    const initConfig: {
        shouldReload: boolean;
        href: string;
        sdkVersion: string | undefined;
        mode: number;
        enableLivePreviewOutsideIframe?: boolean;
    } = {
        shouldReload: config.ssr,
        href: window.location.href,
        sdkVersion: process?.env?.PACKAGE_VERSION,
        mode: config.mode,
    };

    if (config.enableLivePreviewOutsideIframe !== undefined) {
        initConfig.enableLivePreviewOutsideIframe =
            config.enableLivePreviewOutsideIframe;
    }

    livePreviewPostMessage
        ?.send<LivePreviewInitEventResponse>(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.INIT,
            {
                config: initConfig,
            }
        )
        .then((data) => {
            const {
                contentTypeUid,
                entryUid,
                windowType = ILivePreviewWindowType.PREVIEW,
            } = data || {};

            // The builder already answered its own init on the other channel.
            // isPanelOpen() covers the docked-panel arrangement, where the page
            // is top-level so inVisualEditor() cannot recognise it.
            if (inVisualEditor() || isPanelOpen()) {
                return;
            }

            // TODO: the upper condition will the handle the visual editor init double firing issue so later we can remove this once verified
            if (
                Config?.get()?.windowType &&
                Config.get().windowType === ILivePreviewWindowType.BUILDER
            ) {
                return;
            }

            if (contentTypeUid && entryUid) {
                // Sync is explicit here intentionally: auto-effects via deepsignal would go blind when Config.reset() is called.
                Config.set("stackDetails.contentTypeUid", contentTypeUid);
                Config.set("stackDetails.entryUid", entryUid);
                syncToStackSdk({ contentTypeUid, entryUid });
            } else {
                // TODO: add debug logs that runs conditionally
                // PublicLogger.debug(
                //     "init message did not contain contentTypeUid or entryUid."
                // );
            }
            if (
                Config.get().ssr ||
                isOpeningInTimeline() ||
                isOpeningInNewTab()
            ) {
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
