import ContentstackLivePreviewHOC, {
    ICSLivePreview,
} from "./contentstack-live-preview-HOC";

const SHOULD_KEEP_SDK = !(
    process.env.PURGE_PREVIEW_SDK || process.env.REACT_APP_PURGE_PREVIEW_SDK
);

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

export const ContentstackLivePreview = SHOULD_KEEP_SDK
    ? ContentstackLivePreviewHOC
    : (LightLivePreviewHoC as unknown as ICSLivePreview);

export default ContentstackLivePreview;
