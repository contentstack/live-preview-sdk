import ContentstackLivePreviewHOC, {
    ICSLivePreview,
} from "./contentstack-live-preview-HOC";

const LightLivePreviewHoC = {
    init() {},
    onLiveEdit() {},
    onEntryChange(callback: () => void) {
        return callback();
    },
    get hash(): string {
        return "";
    },
    setConfigFromParams() {},
};

export const ContentstackLivePreview =
    process.env.PURGE_PREVIEW_SDK || process.env.REACT_APP_PURGE_PREVIEW_SDK
        ? (LightLivePreviewHoC as unknown as ICSLivePreview)
        : ContentstackLivePreviewHOC;

export default ContentstackLivePreview;
