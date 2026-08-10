import { PublicLogger } from "../logger/logger";

/**
 * Query parameters live preview adds to the page itself. They describe the
 * preview session, not the page, so they are dropped before the URL is handed
 * back to the CMS.
 */
const LIVE_PREVIEW_QUERY_PARAMS = [
    "live_preview",
    "content_type_uid",
    "entry_uid",
    "preview_timestamp",
    "preview_variant",
    "cslp-buttons",
];

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
        LIVE_PREVIEW_QUERY_PARAMS.forEach((param) =>
            url.searchParams.delete(param)
        );

        return url.href;
    } catch (error) {
        PublicLogger.error("Error while reading the current page URL");
        return "";
    }
}
