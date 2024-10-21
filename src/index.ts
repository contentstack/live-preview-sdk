import ContentstackLivePreviewHOC from "./preview/contentstack-live-preview-HOC";

import { IStackSdk as ExternalStackSdkType } from "./types/types";
export type IStackSdk = ExternalStackSdkType;
class LightLivePreviewHoC implements ContentstackLivePreviewHOC {
    static init() {}

    get hash() {
        return "";
    }

    static onEntryChange(callback: (...args: any[]) => void) {
        return callback();
    }

    static onLiveEdit() {
        // intentionally empty
    }

    static unsubscribeOnEntryChange() {
        // intentionally empty
    }

    static getSdkVersion(): string {
        return process?.env?.PACKAGE_VERSION!;
    }
}

// export const ContentstackLivePreview: ContentstackLivePreviewHOC =
//     ContentstackLivePreviewHOC;

export const VB_EmptyBlockParentClass = "visual-builder__empty-block-parent";
export default ContentstackLivePreviewHOC;
