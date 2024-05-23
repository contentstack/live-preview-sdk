import { v4 } from "uuid";
import camelCase from "./utils/camelCase";

import {
    IInitData,
    IStackSdk,
    OnEntryChangeCallback,
    OnEntryChangeCallbackUID,
    OnEntryChangeConfig,
} from "./utils/types";
import LivePreview from "./live-preview";
import { userInitData } from "./utils/defaults";
import { PublicLogger } from "./utils/public-logger";
import { handleWebCompare } from "./compare";
import { handlePageTraversal } from "./utils/handlePageTraversal";

export interface ICSLivePreview {
    livePreview: LivePreview | null;
    userConfig: Partial<IInitData> | null;
    subscribers: { [uid: string]: OnEntryChangeCallback };
    configs: {
        params: ConstructorParameters<typeof URLSearchParams>[0];
    };
    init: (userConfig?: Partial<IInitData>) => Promise<LivePreview> | undefined;
    hash: string;
    setConfigFromParams(
        params: ConstructorParameters<typeof URLSearchParams>[0]
    ): void;
    publish(): void;
    subscribe(callback: OnEntryChangeCallback): OnEntryChangeCallbackUID;
    onEntryChange(
        onChangeCallback: OnEntryChangeCallback,
        config?: OnEntryChangeConfig
    ): OnEntryChangeCallbackUID;
    onLiveEdit(
        onChangeCallback: OnEntryChangeCallback
    ): OnEntryChangeCallbackUID;
    unsubscribeOnEntryChange(callback: string | OnEntryChangeCallback): void;
    getGatsbyDataFormat(sdkQuery: IStackSdk, prefix: string): Promise<any>;
    getSdkVersion(): string;
}

const ContentstackLivePreview: ICSLivePreview = {
    livePreview: null,
    userConfig: null,
    subscribers: {},
    configs: {
        params: {},
    },

    init(
        userConfig: Partial<IInitData> = userInitData
    ): Promise<LivePreview> | undefined {
        if (typeof window !== "undefined") {
            if (ContentstackLivePreview.livePreview) {
                PublicLogger.warn(
                    "You have already initialized the Live Preview SDK. So, any subsequent initialization returns the existing SDK instance."
                );
                return Promise.resolve(ContentstackLivePreview.livePreview);
            } else {
                handleWebCompare();
                handlePageTraversal();

                ContentstackLivePreview.livePreview = new LivePreview(
                    userConfig
                );
                ContentstackLivePreview.livePreview.setOnChangeCallback(
                    ContentstackLivePreview.publish
                );

                ContentstackLivePreview.livePreview.setConfigFromParams(
                    ContentstackLivePreview.configs.params
                );
                ContentstackLivePreview.configs.params = {};

                return Promise.resolve(ContentstackLivePreview.livePreview);
            }
        } else {
            ContentstackLivePreview.userConfig = userConfig;
        }
    },

    get hash(): string {
        if (!ContentstackLivePreview.livePreview) {
            const urlParams = new URLSearchParams(
                ContentstackLivePreview.configs.params
            );
            return urlParams.get("live_preview") ?? "";
        }

        return ContentstackLivePreview.livePreview.hash;
    },

    /**
     * Sets the live preview hash from the query param which is
     * accessible via `hash` property.
     * @param params query param in an object form
     */
    setConfigFromParams(
        params: ConstructorParameters<typeof URLSearchParams>[0] = {}
    ): void {
        if (!ContentstackLivePreview.livePreview) {
            ContentstackLivePreview.configs.params = params;
            return;
        }

        ContentstackLivePreview.livePreview.setConfigFromParams(params);
    },

    publish(): void {
        Object.values<OnEntryChangeCallback>(
            ContentstackLivePreview.subscribers
        ).forEach((func) => {
            func();
        });
    },
    subscribe(callback: OnEntryChangeCallback): OnEntryChangeCallbackUID {
        const callbackUid = v4();
        ContentstackLivePreview.subscribers[callbackUid] = callback;
        return callbackUid;
    },
    /**
     * @type {function}
     * @param onChangeCallback A function param to fetch the data from contentstack database
     * @param config An optional object param, pass {skipInitialRender:Boolean} to skip init call to onChangeCallback
     * @returns Subscribed Callback UID
     */
    onEntryChange(
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
                ContentstackLivePreview.configs.params
            );

            ContentstackLivePreview.configs.params = {};

            ContentstackLivePreview.userConfig = null;
        }
        const callbackUid = ContentstackLivePreview.subscribe(onChangeCallback);
        if (!skipInitialRender) {
            onChangeCallback();
        }
        return callbackUid;
    },
    /**
     * @type {function}
     * @param onChangeCallback A function param to fetch the data from contentstack database on content change.
     * @returns Subscribed Callback UID
     */
    onLiveEdit(
        onChangeCallback: OnEntryChangeCallback
    ): OnEntryChangeCallbackUID {
        return ContentstackLivePreview.onEntryChange(onChangeCallback, {
            skipInitialRender: true,
        });
    },
    unsubscribeOnEntryChange(callback: string | OnEntryChangeCallback): void {
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
    },
    async getGatsbyDataFormat(
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
    },
    getSdkVersion(): string {
        return process.env.PACKAGE_VERSION!;
    },
};

export default ContentstackLivePreview;
