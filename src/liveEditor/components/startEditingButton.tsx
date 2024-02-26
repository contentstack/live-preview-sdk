import { EditIcon } from "./icons";

import Config from "../../configManager/configManager";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";

function StartEditingButtonComponent() {
    return (
        <a
            href={getLiveEditorRedirectionUrl().toString()}
            className="visual-editor__start-editing-btn"
            data-testid="vcms-start-editing-btn"
            onClick={(e) => {
                const event = e as unknown as MouseEvent;
                updateStartEditingHref(event);
            }}
        >
            <EditIcon />
            <span>Start Editing</span>
        </a>
    );
}

/**
 * Returns the redirection URL for the Live Editor.
 * @returns {URL} The redirection URL.
 */
function getLiveEditorRedirectionUrl(): URL {
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

/**
 * Updates the href attribute of the start editing button with the redirection URL.
 *
 * @param event - The mouse event that triggered the update.
 */
function updateStartEditingHref(event: MouseEvent) {

    const startEditingButton = event.currentTarget as HTMLButtonElement;
    startEditingButton.setAttribute(
        "href",
        getLiveEditorRedirectionUrl().toString()
    );
}

export default StartEditingButtonComponent;
