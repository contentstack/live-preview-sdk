import { PublicLogger } from "../logger/logger";
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