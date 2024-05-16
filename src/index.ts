import ContentstackLivePreviewHOC, {
    ICSLivePreview,
} from "./contentstack-live-preview-HOC";

const DEVELOPMENT = process.env.NODE_ENV === "development";

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

export const ContentstackLivePreview = DEVELOPMENT
    ? ContentstackLivePreviewHOC
    : (LightLivePreviewHoC as unknown as ICSLivePreview);

export default ContentstackLivePreview;
