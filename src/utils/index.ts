import { PublicLogger } from "../logger/logger";
import { addLivePreviewQueryTags } from "./addLivePreviewQueryTags";
export function hasWindow(): boolean {
    return typeof window !== "undefined";
}
export { addLivePreviewQueryTags };
export function addParamsToUrl() {
    // Setting the query params to all the click events related to current domain
    window.addEventListener("click", (event: any) => {
        const clickedElement = event.target;
        const anchorElement = clickedElement.closest('a');
        
        // Only proceed if the clicked element is either an anchor or a direct/indirect child of an anchor
        if (!anchorElement || !anchorElement.contains(clickedElement)) {
            return;
        }

        const targetHref: string | any = anchorElement.href;
        const docOrigin: string = document.location.origin;
        if (
            targetHref &&
            targetHref.includes(docOrigin) &&
            !targetHref.includes("live_preview")
        ) {
            const newUrl = addLivePreviewQueryTags(targetHref);
            anchorElement.href = newUrl || targetHref;
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


export function isOpenInPreviewShare(): boolean {
    if (hasWindow()) {
        const urlParams = new URLSearchParams(window.location.search);
        const previewShare = urlParams.get("preview_share");
        return !!previewShare;
    }
    return false;
}
