import { v4 as uuidv4 } from "uuid";

import { isEmpty } from "lodash-es";
import packageJson from "../../package.json";
import { getUserInitData } from "../configManager/config.default";
import Config, { updateConfigFromUrl } from "../configManager/configManager";
import { VisualEditor } from "../liveEditor";
import LivePreview from "../livePreview/live-preview";
import { removeFromOnChangeSubscribers } from "../livePreview/removeFromOnChangeSubscribers";
import {
    OnEntryChangeCallback,
    OnEntryChangeCallbackSubscribers,
    OnEntryChangeCallbackUID,
    OnEntryChangeConfig,
    OnEntryChangeUnsubscribeParameters,
} from "../livePreview/types/onEntryChangeCallback.type";
import { PublicLogger } from "../logger/logger";
import { IInitData } from "../types/types";

class ContentstackLivePreview {
    private static previewConstructors:
        | {
              livePreview: LivePreview;
              liveEditor: VisualEditor;
          }
        | Record<string, never> = {};

    /**
     * The subscribers for the onEntryChange event. We store them here when the SDK is not initialized.
     */
    private static onEntryChangeCallbacks: OnEntryChangeCallbackSubscribers =
        {};

    /**
     * Initializes the Live Preview SDK with the provided user configuration.
     * If the SDK is already initialized, subsequent calls to this method will return the existing SDK instance.
     * @param userConfig - The user configuration to initialize the SDK with. See {@link https://github.com/contentstack/live-preview-sdk/blob/main/docs/live-preview-configs.md#initconfig-iconfig|Live preview User config} for more details.
     * @returns A promise that resolves to the constructors of the Live Preview SDK.
     */
    static init(
        userConfig: Partial<IInitData> = getUserInitData()
    ): Promise<typeof ContentstackLivePreview.previewConstructors> {
        // handle user config
        Config.replace(userConfig);
        updateConfigFromUrl();

        if (typeof window === "undefined") {
            PublicLogger.warn("The SDK is not initialized in the browser.");
            return Promise.resolve(ContentstackLivePreview.previewConstructors);
        }

        if (ContentstackLivePreview.isInitialized()) {
            PublicLogger.warn(
                "You have already initialized the Live Preview SDK. So, any subsequent initialization returns the existing SDK instance."
            );
            return Promise.resolve(ContentstackLivePreview.previewConstructors);
        } else {
            return ContentstackLivePreview.initializePreview();
        }
    }

    /**
     * It is the live preview hash.
     * This hash could be used when data is fetched manually.
     */
    static get hash(): string {
        if (!ContentstackLivePreview.isInitialized()) {
            updateConfigFromUrl(); // check if we could extract from the URL
        }
        return Config.get().hash;
    }

    private static isInitialized(): boolean {
        return !isEmpty(ContentstackLivePreview.previewConstructors);
    }

    private static initializePreview() {
        ContentstackLivePreview.previewConstructors = {
            livePreview: new LivePreview(),
            liveEditor: new VisualEditor(),
        };

        // set up onEntryChange callbacks added when the SDK was not initialized
        const livePreview =
            ContentstackLivePreview.previewConstructors.livePreview;
        Object.entries(ContentstackLivePreview.onEntryChangeCallbacks).forEach(
            ([callbackUid, callback]) => {
                livePreview.subscribeToOnEntryChange(callback, callbackUid);
            }
        );

        ContentstackLivePreview.onEntryChangeCallbacks = {};

        return Promise.resolve(ContentstackLivePreview.previewConstructors);
    }

    /**
     * Registers a callback function to be called when an entry changes.
     * @param onChangeCallback The callback function to be called when an entry changes.
     * @param config Optional configuration for the callback.
     * @param config.skipInitialRender If true, the callback will not be called when it is first registered.
     * @returns A unique identifier for the registered callback.
     *
     * @example
     * ```js
     * const callbackUid = ContentstackLivePreview.onEntryChange(() => {
     *    console.log("Entry changed");
     * });
     *
     * // Unsubscribe the callback
     * ContentstackLivePreview.unsubscribeOnEntryChange(callbackUid);
     * ```
     */
    static onEntryChange(
        onChangeCallback: OnEntryChangeCallback,
        config: OnEntryChangeConfig = {}
    ): OnEntryChangeCallbackUID {
        const { skipInitialRender = false } = config;

        const callbackUid = uuidv4();

        if (ContentstackLivePreview.isInitialized()) {
            ContentstackLivePreview.previewConstructors.livePreview.subscribeToOnEntryChange(
                onChangeCallback,
                callbackUid
            );
        } else {
            ContentstackLivePreview.onEntryChangeCallbacks[callbackUid] =
                onChangeCallback;
        }

        if (!skipInitialRender) {
            onChangeCallback();
        }

        return callbackUid;
    }

    /**
     * Registers a callback function to be called when there is a change in the entry being edited in live preview mode. The difference between this and `onEntryChange` is that this callback will not be called when it is first registered.
     * @param onChangeCallback The callback function to be called when there is a change in the entry.
     * @returns A unique identifier for the registered callback.
     *
     * @example
     * ```js
     * const callbackUid = ContentstackLivePreview.onLiveEdit(() => {
     *   console.log("Entry changed");
     * });
     *
     * // Unsubscribe the callback
     * ContentstackLivePreview.unsubscribeOnEntryChange(callbackUid);
     * ```
     *
     */
    static onLiveEdit(
        onChangeCallback: OnEntryChangeCallback
    ): OnEntryChangeCallbackUID {
        return ContentstackLivePreview.onEntryChange(onChangeCallback, {
            skipInitialRender: true,
        });
    }

    /**
     * Unsubscribes from the entry change event.
     * @param callback - The callback function to be unsubscribed.
     *
     * @example
     * ```js
     * // unsubscribing using the Callback UID
     * const callbackUid = ContentstackLivePreview.onEntryChange(() => {
     *  console.log("Entry changed");
     * });
     *
     * // Unsubscribe the callback
     * ContentstackLivePreview.unsubscribeOnEntryChange(callbackUid);
     * ```
     *
     * @example
     * ```js
     * // unsubscribing using the callback function
     * const callback = () => {console.log("Entry changed")};
     * ContentstackLivePreview.onEntryChange(callback);
     *
     * // Unsubscribe the callback
     * ContentstackLivePreview.unsubscribeOnEntryChange(callback);
     * ```
     *
     * @example
     * ```js
     * // The same is applicable to onLiveEdit
     * const callbackUid = ContentstackLivePreview.onLiveEdit(() => {
     * console.log("Entry changed");
     * });
     *
     * // Unsubscribe the callback
     * ContentstackLivePreview.unsubscribeOnEntryChange(callbackUid);
     * ```
     *
     *
     */
    static unsubscribeOnEntryChange(
        callback: OnEntryChangeUnsubscribeParameters
    ): void {
        if (!ContentstackLivePreview.isInitialized()) {
            removeFromOnChangeSubscribers(
                ContentstackLivePreview.onEntryChangeCallbacks,
                callback
            );
            return;
        }
        ContentstackLivePreview.previewConstructors.livePreview.unsubscribeOnEntryChange(
            callback
        );
    }

    /**
     * Retrieves the version of the SDK.
     * @returns The version of the SDK as a string.
     */
    static getSdkVersion(): string {
        return packageJson.version;
    }
}

export default ContentstackLivePreview;

module.exports = ContentstackLivePreview;
