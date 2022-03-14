import { v4 as uuidv4 } from "uuid";
import camelCase from "just-camel-case";

import { IInitData, IStackSdk, OnEntryChangeCallback } from "./utils/types";
import LivePreview from "./live-preview";
import { userInitData } from "./utils/defaults";

export class ContentstackLivePreview {
    static livePreview: LivePreview | null = null;
    static userConfig: Partial<IInitData> | null = null;
    static subscribers: { [uid: string]: OnEntryChangeCallback } = {};

    static init(
        userConfig: Partial<IInitData> = userInitData
    ): Promise<LivePreview> | undefined {
        if (typeof window !== "undefined") {
            if (ContentstackLivePreview.livePreview) {
                console.warn(
                    "Contentstack Live Preview: You have already initialized the live preview. Returning the existing instance."
                );
                return Promise.resolve(ContentstackLivePreview.livePreview);
            } else {
                ContentstackLivePreview.livePreview = new LivePreview(
                    userConfig
                );
                ContentstackLivePreview.livePreview.setOnChangeCallback(
                    ContentstackLivePreview.publish
                );
                return Promise.resolve(ContentstackLivePreview.livePreview);
            }
        } else {
            ContentstackLivePreview.userConfig = userConfig;
        }
    }

    private static publish(): void {
        Object.values<OnEntryChangeCallback>(
            ContentstackLivePreview.subscribers
        ).forEach((func) => {
            func();
        });
    }

    private static subscribe(callback: OnEntryChangeCallback): void {
        ContentstackLivePreview.subscribers[uuidv4()] = callback;
    }

    static onEntryChange(onChangeCallback: OnEntryChangeCallback): void {
        if (ContentstackLivePreview.userConfig) {
            ContentstackLivePreview.livePreview = new LivePreview(
                ContentstackLivePreview.userConfig
            );
            ContentstackLivePreview.livePreview.setOnChangeCallback(
                ContentstackLivePreview.publish
            );
            ContentstackLivePreview.userConfig = null;
        }
        ContentstackLivePreview.subscribe(onChangeCallback);
        onChangeCallback();
    }

    static unsbscribeOnEntryChange(
        callback: string | OnEntryChangeCallback
    ): void {
        if (typeof callback === "string") {
            if (!ContentstackLivePreview.subscribers[callback]) {
                console.warn(
                    "Contentstack Live Preview: No subscriber found with the given id."
                );
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
                console.warn(
                    "Contentstack Live Preview: No subscriber found with the given callback."
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
                    const entry = { [dataTitle]: ent.toJSON() };

                    return entry;
                })
                .catch((err: unknown) => {
                    console.error(err);
                });
        }
    }
}

export default ContentstackLivePreview;

module.exports = ContentstackLivePreview;
