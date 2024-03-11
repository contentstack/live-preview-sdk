import Config from "../configManager/configManager";
import { PublicLogger } from "../logger/logger";
import { IConfig, ILivePreviewModeConfig } from "../types/types";
import { addLivePreviewQueryTags } from "../utils";
import { LivePreviewEditButton } from "./editButton/editButton";
import { sendInitializeLivePreviewPostMessageEvent } from "./eventManager/postMessageEvent.hooks";
import { removeDataCslp } from "./livePreviewProductionCleanup";
import { removeFromOnChangeSubscribers } from "./removeFromOnChangeSubscribers";
import {
    OnEntryChangeCallback,
    OnEntryChangeCallbackSubscribers,
    OnEntryChangeCallbackUID,
    OnEntryChangeUnsubscribeParameters,
} from "./types/onEntryChangeCallback.type";

export default class LivePreview {
    /**
     * @hideconstructor
     */

    private subscribers: OnEntryChangeCallbackSubscribers = {};

    constructor() {
        this.requestDataSync = this.requestDataSync.bind(this);
        this.subscribeToOnEntryChange =
            this.subscribeToOnEntryChange.bind(this);
        this.publish = this.publish.bind(this);
        this.unsubscribeOnEntryChange =
            this.unsubscribeOnEntryChange.bind(this);

        const config = Config.get();

        if (config.debug) {
            PublicLogger.debug(
                "Contentstack Live Preview Debugging mode: config --",
                Config.config
            );
        }

        if (config.enable) {
            if (
                typeof document !== undefined &&
                document.readyState === "complete"
            ) {
                this.requestDataSync();
            } else {
                window.addEventListener("load", this.requestDataSync);
            }

            // TODO: capetown: add test cases for this condition.
            // TODO: mjrf: Check if we need the second condition here.
            // We are already handling the functions separately in the live editor.
            // render the hover outline only when edit button enable

            if (
                config.editButton.enable ||
                config.mode >= ILivePreviewModeConfig.EDITOR
            ) {
                new LivePreviewEditButton();
            }

            //NOTE - I think we are already handling the link click event here. Let's move it to a function.
            if (config.ssr) {
                // NOTE: what are we doing here?
                window.addEventListener("load", (e) => {
                    const allATags = document.querySelectorAll("a");
                    allATags.forEach((tag) => {
                        const docOrigin: string = document.location.origin;
                        if (tag.href && tag.href.includes(docOrigin)) {
                            const newUrl = addLivePreviewQueryTags(tag.href);
                            tag.href = newUrl;
                        }
                    });
                });

                // Setting the query params to all the click events related to current domain
                window.addEventListener("click", (event: any) => {
                    const target: any = event.target;
                    const targetHref: string | any = target.href;
                    const docOrigin: string = document.location.origin;
                    if (
                        targetHref &&
                        targetHref.includes(docOrigin) &&
                        !targetHref.includes("live_preview")
                    ) {
                        const newUrl = addLivePreviewQueryTags(target.href);
                        event.target.href = newUrl || target.href;
                    }
                });
            }
        } else if (config.cleanCslpOnProduction) {
            removeDataCslp();
        }
    }

    // Request parent for data sync when document loads
    private requestDataSync() {
        const config = Config.get();

        Config.set("onChange", this.publish);

        //! TODO: we replaced the handleOnChange() with this.
        //! I don't think we need this. Confirm and remove it.
        config.onChange();

        sendInitializeLivePreviewPostMessageEvent();
    }

    subscribeToOnEntryChange(
        callback: OnEntryChangeCallback,
        callbackUid: OnEntryChangeCallbackUID
    ): string {
        this.subscribers[callbackUid] = callback;
        return callbackUid;
    }

    private publish(): void {
        Object.values<OnEntryChangeCallback>(this.subscribers).forEach(
            (func) => {
                func();
            }
        );
    }

    unsubscribeOnEntryChange(
        callback: OnEntryChangeUnsubscribeParameters
    ): void {
        removeFromOnChangeSubscribers(this.subscribers, callback);
    }
}
