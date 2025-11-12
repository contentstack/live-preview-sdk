import ContentstackLivePreviewHOC from "./preview/contentstack-live-preview-HOC";
import { IStackSdk as ExternalStackSdkType } from "./types/types";

import LightLivePreviewHoC from "./light-sdk";

export type IStackSdk = ExternalStackSdkType;

export * from "./utils/encodeDecode";

console.log('live preview sdk loaded')
const ContentstackLivePreview =
    typeof process !== "undefined" &&
    (process?.env?.PURGE_PREVIEW_SDK === "true" ||
        process?.env?.REACT_APP_PURGE_PREVIEW_SDK === "true")
        ? LightLivePreviewHoC
        : ContentstackLivePreviewHOC;

export const VB_EmptyBlockParentClass = "visual-builder__empty-block-parent";
export default ContentstackLivePreview;
