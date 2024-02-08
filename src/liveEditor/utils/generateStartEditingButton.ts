import Config from "../../configManager/configManager";
import { extractDetailsFromCslp } from "../../cslp/cslpdata";
import { PublicLogger } from "../../logger/logger";

const editIcon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
<g id="Edit">
<path id="Edit_2" fill-rule="evenodd" clip-rule="evenodd" d="M3.58347 15.3803C3.35617 15.6076 3.22019 15.9104 3.20131 16.2313L3.00244 19.6122C2.95629 20.3967 3.60524 21.0456 4.38975 20.9995L7.7706 20.8006C8.0915 20.7817 8.39431 20.6458 8.62161 20.4185L20.6176 8.4225C21.1301 7.90993 21.1301 7.07891 20.6176 6.56634L17.4356 3.38436C16.923 2.8718 16.092 2.8718 15.5794 3.38436L3.58347 15.3803ZM4.32437 16.2974C4.32707 16.2515 4.3465 16.2083 4.37897 16.1758L14.2003 6.35446L17.4954 9.64949C17.5492 9.70337 17.6113 9.74403 17.6776 9.77148L7.82611 19.623C7.79364 19.6554 7.75038 19.6749 7.70454 19.6776L4.32369 19.8764C4.21161 19.883 4.11891 19.7903 4.1255 19.6782L4.32437 16.2974ZM18.4128 9.03624L19.8221 7.627C19.8953 7.55378 19.8953 7.43506 19.8221 7.36184L16.6401 4.17986C16.5669 4.10663 16.4481 4.10663 16.3749 4.17986L14.9958 5.55897L18.2908 8.854C18.3447 8.90788 18.3854 8.96996 18.4128 9.03624Z" fill="white"/>
</g>
</svg>
`;

/**
 * Generates a start editing button for the visual editor.
 *
 * @param visualEditorWrapper - The HTMLDivElement that wraps the visual editor.
 * @returns The generated HTMLAnchorElement representing the start editing button, or undefined if the visualEditorWrapper is null.
 */
export function generateStartEditingButton(
    visualEditorWrapper: HTMLDivElement | null
): HTMLAnchorElement | undefined {
    if (!visualEditorWrapper) {
        PublicLogger.warn("Live Editor overlay not found.");
        return;
    }

    const startEditingButton = document.createElement("a");

    startEditingButton.innerHTML = editIcon + `<span>Start Editing</span>`;

    startEditingButton.setAttribute(
        "href",
        getLiveEditorRedirectionUrl().toString()
    );
    startEditingButton.setAttribute("data-testid", "vcms-start-editing-btn");
    startEditingButton.classList.add("visual-editor__start-editing-btn");
    startEditingButton.addEventListener("click", updateStartEditingHref);

    visualEditorWrapper.appendChild(startEditingButton);

    return startEditingButton;

    //We cannot get locale from Stacks directly
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
