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

    const hash = window.location.hash;
    const isHashSlash = hash.startsWith("#/");
    const isHashBang = hash.startsWith("#!/");
    const isNoSlash = hash.length > 1 && !isHashSlash && !isHashBang;
    const isHashRouting = isHashSlash || isHashBang || isNoSlash;

    const url = new URL(window.location.href);
    // remove query parameters from the url
    url.search = "";
    if (isHashRouting) {
        // if the hash is #!/about-us or #/about-us or #about-us, we want /about-us
        let pathFromHash;
        if (isHashBang) {
            pathFromHash = hash.substring(2);
        } else if (isHashSlash) {
            pathFromHash = hash.substring(1);
        } else {
            pathFromHash = "/" + hash.substring(1);
        }
        // remove query parameters from the path if we have both hash routing and query string
        let onlyPathname = pathFromHash.split("?")[0];
        url.pathname = (url.pathname + onlyPathname).replace(/\/\//g, "/");
        url.hash = "";
    } else {
        url.hash = "";
    }
    const targetUrl = url.toString().replace(/\/$/, "");

    searchParams.set("target-url", targetUrl);
    if (branch) {
        searchParams.set("branch", branch);
    }
    if (environment) {
        searchParams.set("environment", environment);
    }
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
