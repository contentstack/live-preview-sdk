import ContentstackLivePreviewHOC from "./contentstack-live-preview-HOC";

const DEVELOPMENT = process.env.NODE_ENV === "development";

class LightLivePreviewHoC {
    static init() {}
    static onLiveEdit() {}
    static onEntryChange(callback: () => void) {
        return callback();
    }
    static get hash(): string {
        return "";
    }
    static setConfigFromParams() {}
}

export const ContentstackLivePreview = DEVELOPMENT
    ? ContentstackLivePreviewHOC
    : (LightLivePreviewHoC as unknown as typeof ContentstackLivePreviewHOC);

export default ContentstackLivePreview;
