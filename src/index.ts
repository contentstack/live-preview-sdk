import ContentstackLivePreviewHOC from "./preview/contentstack-live-preview-HOC";
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

        if (!skipInitialRender) {
            callback();
        }

        return "live-preview-id";
    }

    static onLiveEdit(callback: OnEntryChangeCallback) {
        return "live-preview-id";
    }

    static unsubscribeOnEntryChange() {
        // intentionally empty
    }

    static getSdkVersion(): string {
        return process?.env?.PACKAGE_VERSION!;
    }
}

const ContentstackLivePreview =
    process.env.PURGE_PREVIEW_SDK || process.env.REACT_APP_PURGE_PREVIEW_SDK
        ? LightLivePreviewHoC
        : ContentstackLivePreviewHOC;

export const VB_EmptyBlockParentClass = "visual-builder__empty-block-parent";
export default ContentstackLivePreview;
