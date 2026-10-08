import { PublicLogger } from "../logger/logger";
import { LIVE_PREVIEW_QUERY_PARAMS } from "./livePreviewQueryParams.constant";
export function addLivePreviewQueryTags(link: string): string {
    try {
        const docUrl: URL = new URL(document.location.href);
        const newUrl: URL = new URL(link);
        LIVE_PREVIEW_QUERY_PARAMS.forEach((param) => {
            const value: string | null = docUrl.searchParams.get(param);
            if (value) {
                newUrl.searchParams.set(param, value);
            }
        });
        return newUrl.href;
    } catch (error) {
        PublicLogger.error("Error while adding live preview to URL");
        return link;
    }
}
