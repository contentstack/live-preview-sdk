import { PublicLogger } from "../logger/logger";
import { addLivePreviewQueryTags } from "./addLivePreviewQueryTags";
export function hasWindow(): boolean {
    return typeof window !== "undefined";
}
export { addLivePreviewQueryTags };
export function addParamsToUrl() {
    // Setting the query params to all the click events related to current domain
    window.addEventListener("click", (event: any) => {
        const target: any = event.target;
        const targetHref: string | any = target.href;
        const docOrigin: string = document.location.origin;
        if (
            targetHref &&
            targetHref.includes(docOrigin) &&
            !targetHref.includes("live_preview")
        ) {
            const newUrl = addLivePreviewQueryTags(target.href);
            event.target.href = newUrl || target.href;
        }
    });
}
export function isOpeningInTimeline(): boolean {
    if (hasWindow()) {
        const urlParams = new URLSearchParams(window.location.search);
        const previewTimestamp = urlParams.get("preview_timestamp");
        return !!previewTimestamp;
    }
    return false;
}

export function isOpenInBuilder(): boolean {
    if (hasWindow()) {
        const urlParams = new URLSearchParams(window.location.search);
        const builder = urlParams.get("builder");
        return !!builder;
    }
    return false;
}
