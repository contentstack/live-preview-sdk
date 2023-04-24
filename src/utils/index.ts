import { PublicLogger } from "./public-logger";
import { IConfigEditButton, IEditButtonPosition } from "./types";

export function hasWindow(): boolean {
    return typeof window !== "undefined";
}

export const tooltipSingularInnerHtml = `<div class="singular edit-button">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>Edit
  </div>`;

export const tooltipMultipleInnerHtml = `<div class="edit-button" title="edit">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>
  </div>
  <div title="click element" class="external-link-button">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.66654 2.66758H13.3332V13.3342H6.66654V16.0009H13.3332C14.0405 16.0009 14.7187 15.72 15.2188 15.2199C15.7189 14.7198 15.9999 14.0415 15.9999 13.3342V2.66758C15.9999 1.96034 15.7189 1.28206 15.2188 0.781964C14.7187 0.281867 14.0405 0.000915527 13.3332 0.000915527H2.66654C1.9593 0.000915527 1.28102 0.281867 0.780927 0.781964C0.280829 1.28206 -0.00012207 1.96034 -0.00012207 2.66758V9.33425H2.66654V2.66758Z" fill="#718096" />
      <path d="M6.94263 7.05734L0.999958 13L2.88529 14.8853L8.82796 8.94267L10.8853 11V5.00001H4.88529L6.94263 7.05734Z" fill="#718096" />
    </svg>
  </div>`;

export const createSingularEditButton = (
    editCallback: (e: MouseEvent) => void
): HTMLDivElement => {
    const singularEditButton = document.createElement("div");
    singularEditButton.classList.add("cslp-tooltip-child", "singular");
    singularEditButton.setAttribute(
        "data-test-id",
        "cslp-singular-edit-button"
    );
    singularEditButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>Edit`;

    singularEditButton.addEventListener("click", editCallback);

    return singularEditButton;
};

export const createMultipleEditButton = (
    editCallback: (e: MouseEvent) => void,
    linkCallback: (e: MouseEvent) => void
): HTMLDivElement => {
    const multipleEditButton = document.createElement("div");
    multipleEditButton.classList.add("cslp-tooltip-child");
    multipleEditButton.setAttribute("data-title", "Edit");
    multipleEditButton.setAttribute(
        "data-test-id",
        "cslp-multiple-edit-button"
    );
    multipleEditButton.innerHTML = ` <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>`;

    multipleEditButton.addEventListener("click", editCallback);

    const multipleExternalLinkButton = document.createElement("div");
    multipleExternalLinkButton.classList.add("cslp-tooltip-child");
    multipleExternalLinkButton.setAttribute("data-title", "Go to link");
    multipleExternalLinkButton.setAttribute(
        "data-test-id",
        "cslp-multiple-external-link-button"
    );
    multipleExternalLinkButton.innerHTML = ` <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.66654 2.66758H13.3332V13.3342H6.66654V16.0009H13.3332C14.0405 16.0009 14.7187 15.72 15.2188 15.2199C15.7189 14.7198 15.9999 14.0415 15.9999 13.3342V2.66758C15.9999 1.96034 15.7189 1.28206 15.2188 0.781964C14.7187 0.281867 14.0405 0.000915527 13.3332 0.000915527H2.66654C1.9593 0.000915527 1.28102 0.281867 0.780927 0.781964C0.280829 1.28206 -0.00012207 1.96034 -0.00012207 2.66758V9.33425H2.66654V2.66758Z" fill="#718096" />
      <path d="M6.94263 7.05734L0.999958 13L2.88529 14.8853L8.82796 8.94267L10.8853 11V5.00001H4.88529L6.94263 7.05734Z" fill="#718096" />
    </svg>`;

    multipleExternalLinkButton.addEventListener("click", linkCallback);

    const multipleEditFragment = document.createDocumentFragment();
    multipleEditFragment.appendChild(multipleEditButton);
    multipleEditFragment.appendChild(multipleExternalLinkButton);

    const multipleDiv = document.createElement("div");
    multipleDiv.appendChild(multipleEditFragment);
    multipleDiv.classList.add("multiple");

    return multipleDiv;
};

export function addLivePreviewQueryTags(link: string): string {
    try {
        const docUrl: URL = new URL(document.location.href);
        const newUrl: URL = new URL(link);
        const livePreviewHash: string | null =
            docUrl.searchParams.get("live_preview");
        const ctUid: string | null =
            docUrl.searchParams.get("content_type_uid");
        const entryUid: string | null = docUrl.searchParams.get("entry_uid");
        if (livePreviewHash && ctUid && entryUid) {
            newUrl.searchParams.set("live_preview", livePreviewHash);
            newUrl.searchParams.set("content_type_uid", ctUid);
            newUrl.searchParams.set("entry_uid", entryUid);
        }
        return newUrl.href;
    } catch (error) {
        PublicLogger.error("Error while adding live preview to URL");
        return link;
    }
}

function inIframe() {
    return window.location !== window.parent.location;
}

export function shouldRenderEditButton(editButton: IConfigEditButton): boolean {
    if (!editButton.enable) return false;

    // return boolean in case of cslp-buttons query added in url
    try {
        const currentLocation = new URL(window.location.href);
        const cslpButtonQueryValue =
            currentLocation.searchParams.get("cslp-buttons");
        if (cslpButtonQueryValue)
            return cslpButtonQueryValue === "false" ? false : true;
    } catch (error) {
        PublicLogger.error(error);
    }

    // case if inside live preview
    if (
        inIframe() &&
        editButton.exclude?.find(
            (exclude) => exclude === "insideLivePreviewPanel"
        )
    ) {
        return false;
    } else if (inIframe()) {
        return true;
    }

    // case outside live preview
    if (
        editButton.exclude?.find(
            (exclude) => exclude === "outsideLivePreviewPanel"
        )
    ) {
        return false;
    }

    // Priority list => 1. cslpEditButton query value 2.  Inside live preview  3. renderCslpButtonByDefault value selected by user
    return true;
}

export function getEditButtonPosition(
    currentHoveredElement: HTMLElement | null,
    defaultPosition: string | undefined
): IEditButtonPosition {
    if (!currentHoveredElement)
        return { upperBoundOfTooltip: 0, leftBoundOfTooltip: 0 };

    const cslpButtonPosition = currentHoveredElement.getAttribute(
        "data-cslp-button-position"
    );
    if (cslpButtonPosition) {
        return calculateEditButtonPosition(
            currentHoveredElement,
            cslpButtonPosition
        );
    }

    // NOTE: position "top" and "top-left" will be the position of edit button if no default position passed in config
    return calculateEditButtonPosition(
        currentHoveredElement,
        defaultPosition || "top"
    );
}

function calculateEditButtonPosition(
    currentHoveredElement: HTMLElement,
    cslpButtonPosition: string
): IEditButtonPosition {
    const editButtonPosition: IEditButtonPosition = {
        upperBoundOfTooltip: 0,
        leftBoundOfTooltip: 0,
    };
    const currentRectOfElement = currentHoveredElement.getBoundingClientRect();
    try {
        switch (cslpButtonPosition) {
            case "top-center":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - 40;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.width / 2 - 35.5;
                break;
            case "top-right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - 40;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right - 72;
                break;
            case "right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - 5;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right + 5;
                break;
            case "bottom" || "bottom-left":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom + 5;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left - 5;
                break;
            case "bottom-center":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom + 5;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.width / 2 - 35.5;
                break;
            case "bottom-right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom + 5;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right - 72;
                break;
            case "left":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - 5;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left - 77;
                break;
            // default position => top, top-left or any other string
            default:
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - 40;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left - 5;
                break;
        }
        return editButtonPosition;
    } catch (error) {
        PublicLogger.error(error);
        return editButtonPosition;
    }
}
