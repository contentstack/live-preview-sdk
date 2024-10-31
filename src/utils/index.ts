import { PublicLogger } from "../logger/logger";

export function hasWindow(): boolean {
    return typeof window !== "undefined";
}
export function addLivePreviewQueryTags(link: string): string {
    try {
        const docUrl: URL = new URL(document.location.href);
        const newUrl: URL = new URL(link);
        const livePreviewHash: string | null =
            docUrl.searchParams.get("live_preview");
        const ctUid: string | null =
            docUrl.searchParams.get("content_type_uid");
        const entryUid: string | null = docUrl.searchParams.get("entry_uid");
        if (livePreviewHash && ctUid && entryUid) {
            newUrl.searchParams.set("live_preview", livePreviewHash);
            newUrl.searchParams.set("content_type_uid", ctUid);
            newUrl.searchParams.set("entry_uid", entryUid);
        }
        return newUrl.href;
    } catch (error) {
        PublicLogger.error("Error while adding live preview to URL");
        return link;
    }
}
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