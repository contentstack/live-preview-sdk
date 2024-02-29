import Config from "../../configManager/configManager";
import { extractDetailsFromCslp } from "../../cslp";

/**
 * Returns the redirection URL for the Live Editor.
 * @returns {URL} The redirection URL.
 */
export default function getLiveEditorRedirectionUrl(): URL {
    const { stackDetails, clientUrlParams } = Config.get();
    const { branch, apiKey, environment, locale } = stackDetails;
    const { url: appUrl } = clientUrlParams;

    const completeURL = new URL(
        `/live-editor/stack/${apiKey}/environment/${environment}`,
        appUrl
    );

    if (branch) {
        completeURL.searchParams.set("branch", branch);
    }

    completeURL.searchParams.set("target-url", window.location.href);

    // get the locale from the data cslp attribute
    const elementWithDataCslp = document.querySelector(`[data-cslp]`);

    if (elementWithDataCslp) {
        const cslpData = elementWithDataCslp.getAttribute(
            "data-cslp"
        ) as string;
        const { locale } = extractDetailsFromCslp(cslpData);

        completeURL.searchParams.set("locale", locale);
    } else if (locale) {
        completeURL.searchParams.set("locale", locale);
    }

    return completeURL;
}
