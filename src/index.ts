import ContentstackLivePreviewHOC from "./preview/contentstack-live-preview-HOC";
import { v4 as uuidv4 } from "uuid";

import { IStackSdk as ExternalStackSdkType } from "./types/types";

import {
    OnEntryChangeCallback,
    OnEntryChangeCallbackUID,
    OnEntryChangeConfig,
} from "./livePreview/types/onEntryChangeCallback.type";

export type IStackSdk = ExternalStackSdkType;

class LightLivePreviewHoC {
    private static previewConstructors = {};
    private static onEntryChangeCallbacks = {};

    static init() {
        if (typeof window === "undefined") {
            return Promise.resolve(LightLivePreviewHoC.previewConstructors);
        }

        return LightLivePreviewHoC.initializePreview();
    }

    private static initializePreview() {
        LightLivePreviewHoC.previewConstructors = {
            livePreview: {},
            visualBuilder: {},
        };

        LightLivePreviewHoC.onEntryChangeCallbacks = {};

        return Promise.resolve(LightLivePreviewHoC.previewConstructors);
    }

    static get hash() {
        return "";
    }

    static get config() {
        return {};
    }

    static isInitialized() {
        return false;
    }

    static onEntryChange(
        callback: OnEntryChangeCallback,
        config: OnEntryChangeConfig = {}
    ): OnEntryChangeCallbackUID {
        const { skipInitialRender = false } = config;
        const callbackUid = uuidv4();

        if (!skipInitialRender) {
            callback();
        }

        return callbackUid;
    }

    static onLiveEdit(callback: OnEntryChangeCallback) {
        return uuidv4();
    }

    static unsubscribeOnEntryChange() {
        // intentionally empty
    }

    static getSdkVersion(): string {
        return process?.env?.PACKAGE_VERSION!;
    }
}

let ContentstackLivePreview;

if (
    process.env.PURGE_PREVIEW_SDK === "true" ||
    process.env.REACT_APP_PURGE_PREVIEW_SDK === "true"
) {
    ContentstackLivePreview = LightLivePreviewHoC;
} else {
    ContentstackLivePreview = ContentstackLivePreviewHOC;
}

export const VB_EmptyBlockParentClass = "visual-builder__empty-block-parent";
export default ContentstackLivePreview;
