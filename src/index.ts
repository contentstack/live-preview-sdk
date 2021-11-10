/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from "uuid";
import camelCase from "just-camel-case";

import { IInitData, IStackSdk } from "./utils/types";
import LivePreview from "./live-preview";
import { userInitData } from "./utils/defaults";

import "./styles.css";

export class ContentstackLivePreview {
    static livePreview: LivePreview | null = null;
    static userConfig: Partial<IInitData> | null = null;
    static subscribers: any = {};

    static init = (
        userConfig: Partial<IInitData> = userInitData
    ): Promise<LivePreview> | undefined => {
        if (typeof window !== "undefined") {
            if (ContentstackLivePreview.livePreview) {
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
    };

    private static publish = (): void => {
        Object.values(ContentstackLivePreview.subscribers).forEach(
            (func: any) => {
                func();
            }
        );
    };

    private static subscribe = (callback: any): void => {
        ContentstackLivePreview.subscribers[uuidv4()] = callback;
    };

    static onEntryChange = (onChangeCallback: () => void) => {
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
    };

    static getGatsbyDataFormat = async (
        sdkQuery: IStackSdk,
        prefix: string
    ) => {
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
                .catch((err: any) => {
                    console.error(err);
                });
        }
    };
}

export default ContentstackLivePreview;

module.exports = ContentstackLivePreview;
