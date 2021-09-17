/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { v4 as uuidv4 } from 'uuid'

import { IInitData } from "./utils/types";
import LivePreview from "./live-preview";
import { userInitData } from "./utils/defaults";

import './styles.css'

export class ContentstackLivePreview {
    static livePreview: LivePreview | null = null;
    static userConfig: Partial<IInitData> | null = null;
    static subscribers: any = {};

    static init = (userConfig: Partial<IInitData> = userInitData): Promise<LivePreview> | undefined => {
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

    static publish = (): void => {
        Object.values(ContentstackLivePreview.subscribers).forEach(
            (func: any) => {
                func();
            }
        );
    };

    static subscribe = (callback: any): void => {
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
        onChangeCallback()
    };
}

export default ContentstackLivePreview;

module.exports = ContentstackLivePreview;
