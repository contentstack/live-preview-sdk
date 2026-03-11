/**
 * Purged entry: only the light SDK. Use this via resolve.alias in production
 * to exclude the full SDK (edit button, Visual Builder) from the bundle.
 * Same API as the main entry; no full HOC or DOM side effects.
 */
import { IStackSdk as ExternalStackSdkType } from "./types/types";
import LightLivePreviewHoC from "./light-sdk";

export type IStackSdk = ExternalStackSdkType;

export const VB_EmptyBlockParentClass = "visual-builder__empty-block-parent";
export default LightLivePreviewHoC;
