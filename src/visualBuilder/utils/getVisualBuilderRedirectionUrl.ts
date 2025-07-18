import Config from "../../configManager/configManager";
import { extractDetailsFromCslp } from "../../cslp";

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

    // Set the current page (without query string) as the target URL
    searchParams.set(
        "target-url",
        window.location.origin + window.location.pathname
    );

    // get the locale from the data cslp attribute
    const elementWithDataCslp = document.querySelector(`[data-cslp]`);

    if (elementWithDataCslp) {
        const cslpData = elementWithDataCslp.getAttribute(
            "data-cslp"
        ) as string;
        const { locale } = extractDetailsFromCslp(cslpData);

        searchParams.set("locale", locale);
    } else if (locale) {
        searchParams.set("locale", locale);
    }

    const completeURL = new URL(
        `/#!/stack/${apiKey}/visual-builder?${searchParams.toString()}`,
        appUrl
    );
    return completeURL;
}
