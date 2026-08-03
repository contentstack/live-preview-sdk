import Config from "../../configManager/configManager";
import { extractDetailsFromCslp, isValidCslp } from "../../cslp";
import { resolvePageContext } from "./resolvePageContext";

/**
 * Builds the params that tell Visual Builder which page it is editing.
 *
 * Shared by the redirect flow and the docked panel flow: both need the same
 * context, they just differ in where they send it.
 */
export function buildVisualBuilderSearchParams(): URLSearchParams {
    const { stackDetails } = Config.get();
    const { branch, environment, locale } = stackDetails;

    const searchParams = new URLSearchParams();
    if (branch) {
        searchParams.set("branch", branch);
    }
    if (environment) {
        searchParams.set("environment", environment);
    }

    searchParams.set("target-url", window.location.href);

    // get the locale from the data cslp attribute
    const elementWithDataCslp = document.querySelector(`[data-cslp]`);
    let localeToUse = locale;

    if (elementWithDataCslp) {
        const cslpData = elementWithDataCslp.getAttribute("data-cslp");
        if (isValidCslp(cslpData)) {
            const { locale: cslpLocale } = extractDetailsFromCslp(cslpData);
            localeToUse = cslpLocale;
        }
    }

    if (localeToUse) {
        searchParams.set("locale", localeToUse);
    }

    const { entryUid, contentTypeUid } = resolvePageContext();

    // Fall back to whatever the page URL already carries. resolvePageContext reads
    // the rendered page, which on a reload has not fetched its entry yet — so
    // without this the docked panel can come up with no entry context at all, and
    // the builder then has nothing to open.
    const pageParams = new URLSearchParams(window.location.search);
    const resolvedEntryUid = entryUid || pageParams.get("entry_uid");
    const resolvedContentTypeUid =
        contentTypeUid || pageParams.get("content_type_uid");

    if (resolvedEntryUid) {
        searchParams.set("entry_uid", resolvedEntryUid);
    }
    if (resolvedContentTypeUid) {
        searchParams.set("content_type_uid", resolvedContentTypeUid);
    }

    return searchParams;
}

/**
 * Returns the redirection URL for the Visual builder.
 * @returns {URL} The redirection URL.
 */
export default function getVisualBuilderRedirectionUrl(): URL {
    const { stackDetails, clientUrlParams } = Config.get();
    const { apiKey } = stackDetails;
    const { url: appUrl } = clientUrlParams;

    const completeURL = new URL(
        `/#!/stack/${apiKey}/visual-editor?${buildVisualBuilderSearchParams().toString()}`,
        appUrl
    );
    return completeURL;
}
