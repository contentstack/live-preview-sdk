import ContentstackLivePreviewHOC from "./preview/contentstack-live-preview-HOC";
import packageJson from "../package.json";

class LightLivePreviewHoC implements ContentstackLivePreviewHOC {
    init() {}

    get hash() {
        return "";
    }

    onEntryChange(callback: (...args: any[]) => void) {
        return callback();
    }

    onLiveEdit() {
        // intentionally empty
    }

    unsubscribeOnEntryChange() {
        // intentionally empty
    }

    static getSdkVersion(): string {
        return packageJson.version;
    }
}

export const ContentstackLivePreview: ContentstackLivePreviewHOC =
    process.env.PURGE_PREVIEW_SDK || process.env.REACT_APP_PURGE_PREVIEW_SDK
        ? LightLivePreviewHoC
        : ContentstackLivePreviewHOC;

export default ContentstackLivePreview;
