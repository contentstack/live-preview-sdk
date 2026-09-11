import { PublicLogger } from "../logger/logger";
import { LIVE_PREVIEW_QUERY_PARAMS } from "./livePreviewQueryParams.constant";

/**
 * The preview session parameters plus `cslp-buttons`, which the edit button reads
 * off the page URL. All of them describe the preview, not the page, so they are
 * dropped before the URL is handed back to the CMS.
 */
const PARAMS_TO_DROP = [...LIVE_PREVIEW_QUERY_PARAMS, "cslp-buttons"];

/**
 * The URL of the page the visitor is on, without live preview's own query
 * parameters.
 *
 * The CMS uses this to keep the preview on the page the editor clicked Edit
 * from. It cannot derive that from the entry: a referenced entry can appear on
 * several pages, and a nested one (page -> hero -> image) has no page among its
 * direct references at all.
 *
 * Returns an empty string outside a browser or if the URL cannot be parsed, so
 * callers can simply omit the parameter.
 */
export function getCurrentPageUrl(): string {
    try {
        if (typeof window === "undefined" || !window.location?.href) return "";

        const url = new URL(window.location.href);
        PARAMS_TO_DROP.forEach((param) => url.searchParams.delete(param));

        return url.href;
    } catch (error) {
        PublicLogger.error("Error while reading the current page URL");
        return "";
    }
}
