import { v4 as uuidv4 } from "uuid";
import camelCase from "just-camel-case";
import packageJson from "../package.json";

import {
    IInitData,
    IStackSdk,
    OnEntryChangeCallback,
    OnEntryChangeCallbackUID,
    OnEntryChangeConfig,
} from "./types/types";
import LivePreview from "./live-preview";
import { getUserInitData } from "./utils/defaults";
import { PublicLogger } from "./utils/public-logger";

export class ContentstackLivePreview {
    static livePreview: LivePreview | null = null;
    static userConfig: Partial<IInitData> | null = null;
    static subscribers: { [uid: string]: OnEntryChangeCallback } = {};
    static configs: {
        params: ConstructorParameters<typeof URLSearchParams>[0];
    } = {
        params: {},
    };

    static init(
        userConfig: Partial<IInitData> = getUserInitData()
    ): Promise<LivePreview> | undefined {
        if (typeof window !== "undefined") {
            if (ContentstackLivePreview.livePreview) {
                PublicLogger.warn(
                    "You have already initialized the Live Preview SDK. So, any subsequent initialization returns the existing SDK instance."
                );
                return Promise.resolve(ContentstackLivePreview.livePreview);
            } else {
                ContentstackLivePreview.livePreview = new LivePreview(
                    userConfig
                );
                ContentstackLivePreview.livePreview.setOnChangeCallback(
                    ContentstackLivePreview.publish
                );

                ContentstackLivePreview.livePreview.setConfigFromParams(
                    this.configs.params
                );
                this.configs.params = {};

                return Promise.resolve(ContentstackLivePreview.livePreview);
            }
        } else {
            ContentstackLivePreview.userConfig = userConfig;
        }
    }

    /**
     * It is the live preview hash.
     * This hash could be used when data is fetched manually.
     */
    static get hash(): string {
        if (!this.livePreview) {
            const urlParams = new URLSearchParams(this.configs.params);
            return urlParams.get("live_preview") ?? "";
        }

        return this.livePreview.hash;
    }

    /**
     * Sets the live preview hash from the query param which is
     * accessible via `hash` property.
     * @param params query param in an object form
     */
    static setConfigFromParams(
        params: ConstructorParameters<typeof URLSearchParams>[0] = {}
    ): void {
        if (!this.livePreview) {
            this.configs.params = params;
            return;
        }

        this.livePreview.setConfigFromParams(params);
    }

    private static publish(): void {
        Object.values<OnEntryChangeCallback>(
            ContentstackLivePreview.subscribers
        ).forEach((func) => {
            func();
        });
    }

    private static subscribe(
        callback: OnEntryChangeCallback
    ): OnEntryChangeCallbackUID {
        const callbackUid = uuidv4();
        ContentstackLivePreview.subscribers[callbackUid] = callback;
        return callbackUid;
    }
    /**
     * @type {function}
     * @param onChangeCallback A function param to fetch the data from contentstack database
     * @param config An optional object param, pass {skipInitialRender:Boolean} to skip init call to onChangeCallback
     * @returns Subscribed Callback UID
     */
    static onEntryChange(
        onChangeCallback: OnEntryChangeCallback,
        config?: OnEntryChangeConfig
    ): OnEntryChangeCallbackUID {
        const { skipInitialRender = false } = config || {};
        if (ContentstackLivePreview.userConfig) {
            ContentstackLivePreview.livePreview = new LivePreview(
                ContentstackLivePreview.userConfig
            );
            ContentstackLivePreview.livePreview.setOnChangeCallback(
                ContentstackLivePreview.publish
            );

            ContentstackLivePreview.livePreview.setConfigFromParams(
                this.configs.params
            );

            this.configs.params = {};

            ContentstackLivePreview.userConfig = null;
        }
        const callbackUid = ContentstackLivePreview.subscribe(onChangeCallback);
        if (!skipInitialRender) {
            onChangeCallback();
        }
        return callbackUid;
    }

    /**
     * @type {function}
     * @param onChangeCallback A function param to fetch the data from contentstack database on content change.
     * @returns Subscribed Callback UID
     */
    static onLiveEdit(
        onChangeCallback: OnEntryChangeCallback
    ): OnEntryChangeCallbackUID {
        return ContentstackLivePreview.onEntryChange(onChangeCallback, {
            skipInitialRender: true,
        });
    }

    static unsubscribeOnEntryChange(
        callback: string | OnEntryChangeCallback
    ): void {
        if (typeof callback === "string") {
            if (!ContentstackLivePreview.subscribers[callback]) {
                PublicLogger.warn("No subscriber found with the given id.");
            }
            delete ContentstackLivePreview.subscribers[callback];
        } else if (typeof callback === "function") {
            const isCallbackDeleted = Object.entries<() => void>(
                ContentstackLivePreview.subscribers
            ).some(([uid, func]) => {
                if (func === callback) {
                    delete ContentstackLivePreview.subscribers[uid];
                    return true;
                }
                return false;
            });

            if (!isCallbackDeleted) {
                PublicLogger.warn(
                    "No subscriber found with the given callback."
                );
            }
        }
    }

    static async getGatsbyDataFormat(
        sdkQuery: IStackSdk,
        prefix: string
    ): Promise<any> {
        if (typeof sdkQuery.find === "function") {
            return sdkQuery
                .toJSON()
                .find()
                .then((result: { [key: string]: any }) => {
                    return result.map((res: { [key: string]: any }) => {
                        return res.map((entry: { [key: string]: any }) => {
                            const dataTitle = camelCase(
                                `${prefix}_${sdkQuery.content_type_uid}`
                            );
                            return { [dataTitle]: entry };
                        });
                    });
                })
                .catch((err: any) => {
                    console.error(err);
                });
        } else if (typeof sdkQuery.fetch === "function") {
            return sdkQuery
                .toJSON()
                .fetch()
                .then((ent: { [key: string]: any }) => {
                    const dataTitle = camelCase(
                        `${prefix}_${sdkQuery.content_type_uid}`
                    );
                    const entry = { [dataTitle]: ent };

                    return entry;
                })
                .catch((err: unknown) => {
                    console.error(err);
                });
        }
    }

    static getSdkVersion(): string {
        return packageJson.version;
    }
}

export default ContentstackLivePreview;

module.exports = ContentstackLivePreview;
