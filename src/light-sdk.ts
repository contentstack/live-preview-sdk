import { OnEntryChangeCallbackUID, OnEntryChangeConfig } from "./livePreview/types/onEntryChangeCallback.type";

import { OnEntryChangeCallback } from "./livePreview/types/onEntryChangeCallback.type";
import { IExportedConfig } from "./types/types";

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
        return {} as IExportedConfig;
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

export default LightLivePreviewHoC;