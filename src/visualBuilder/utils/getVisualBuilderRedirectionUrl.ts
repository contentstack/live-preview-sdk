import Config from "../../configManager/configManager";
import { extractDetailsFromCslp, isValidCslp } from "../../cslp";
import { resolvePageContext } from "./resolvePageContext";

/**
 * The page's editing context as Visual Builder reads it from its URL: branch,
 * environment, target URL, locale, entry and content type.
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

    if (entryUid) {
        searchParams.set("entry_uid", entryUid);
    }
    if (contentTypeUid) {
        searchParams.set("content_type_uid", contentTypeUid);
    }

    return searchParams;
}

/**
 * Returns the redirection URL for the Visual builder.
 * @returns {URL} The redirection URL.
 */
export default function getVisualBuilderRedirectionUrl(): URL {
    const { stackDetails, clientUrlParams } = Config.get();
    return new URL(
        `/#!/stack/${stackDetails.apiKey}/visual-editor?${buildVisualBuilderSearchParams().toString()}`,
        clientUrlParams.url
    );
}
