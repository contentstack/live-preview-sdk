import Config from "../../configManager/configManager";
import { extractDetailsFromCslp, isValidCslp } from "../../cslp";

/**
 * Returns the redirection URL for the Visual builder.
 * @returns {URL} The redirection URL.
 */
export default function getVisualBuilderRedirectionUrl(): URL {
    const { stackDetails, clientUrlParams } = Config.get();
    const { branch, apiKey, environment, locale } = stackDetails;
    const { url: appUrl } = clientUrlParams;

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

    const completeURL = new URL(
        `/#!/stack/${apiKey}/visual-builder?${searchParams.toString()}`,
        appUrl
    );
    return completeURL;
}
