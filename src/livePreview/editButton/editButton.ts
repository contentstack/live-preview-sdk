import { inIframe } from "../../common/inIframe";
import Config from "../../configManager/configManager";
import { addCslpOutline, extractDetailsFromCslp } from "../../cslp";
import { PublicLogger } from "../../logger/logger";
import {
    IClientUrlParams,
    IConfigEditButton,
    IEditButtonPosition,
    ILivePreviewWindowType,
    IStackDetails,
} from "../../types/types";
import livePreviewPostMessage from "../eventManager/livePreviewEventManager";

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
        const buttonMeasurementValues = {
            width: 72,
            halfWidth: 36,
            height: 40,
            basicMargin: 5,
            widthWithMargin: 77,
        };

        switch (cslpButtonPosition) {
            case "top-center":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - buttonMeasurementValues.height;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.width / 2 -
                    buttonMeasurementValues.halfWidth +
                    currentRectOfElement.left;
                break;
            case "top-right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - buttonMeasurementValues.height;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right - buttonMeasurementValues.width;
                break;
            case "right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top -
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right +
                    buttonMeasurementValues.basicMargin;
                break;
            case "bottom":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom +
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left -
                    buttonMeasurementValues.basicMargin;
                break;
            case "bottom-left":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom +
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left -
                    buttonMeasurementValues.basicMargin;
                break;
            case "bottom-center":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom +
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.width / 2 -
                    buttonMeasurementValues.halfWidth +
                    currentRectOfElement.left;
                break;
            case "bottom-right":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.bottom +
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.right - buttonMeasurementValues.width;
                break;
            case "left":
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top -
                    buttonMeasurementValues.basicMargin;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left -
                    buttonMeasurementValues.widthWithMargin;
                break;
            // default position => top, top-left or any other string
            default:
                editButtonPosition.upperBoundOfTooltip =
                    currentRectOfElement.top - buttonMeasurementValues.height;
                editButtonPosition.leftBoundOfTooltip =
                    currentRectOfElement.left -
                    buttonMeasurementValues.basicMargin;
                break;
        }
        return editButtonPosition;
    } catch (error) {
        PublicLogger.error(error);
        return editButtonPosition;
    }
}

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

export function shouldRenderEditButton(editButton: IConfigEditButton): boolean {
    if (!editButton.enable) {
        if (editButton.enable === undefined)
            PublicLogger.error(
                "enable key is required inside editButton object"
            );
        return false;
    }

    // return boolean in case of cslp-buttons query added in url
    try {
        const currentLocation = new URL(window.location.href);
        const cslpButtonQueryValue =
            currentLocation.searchParams.get("cslp-buttons");
        if (
            cslpButtonQueryValue !== null &&
            editButton.includeByQueryParameter !== false
        )
            return cslpButtonQueryValue === "false" ? false : true;
    } catch (error) {
        PublicLogger.error(error);
    }

    // case if inside live preview or inside live editor
    if (
        inIframe() ||
        editButton.exclude?.find(
            (exclude) => exclude === "insideLivePreviewPortal"
        )
    ) {
        return false;
    }

    // case outside live preview
    if (
        editButton.exclude?.find(
            (exclude) => exclude === "outsideLivePreviewPortal"
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

export class LivePreviewEditButton {
    private tooltip: HTMLButtonElement | null = null;
    private typeOfCurrentChild: "singular" | "multiple" = "singular";
    private tooltipChild: {
        singular: HTMLDivElement | null;
        multiple: HTMLDivElement | null;
    } = {
        singular: null,
        multiple: null,
    };

    constructor() {
        this.createCslpTooltip = this.createCslpTooltip.bind(this);
        this.updateTooltipPosition = this.updateTooltipPosition.bind(this);
        this.addEditStyleOnHover = this.addEditStyleOnHover.bind(this);
        this.scrollHandler = this.scrollHandler.bind(this);
        this.generateRedirectUrl = this.generateRedirectUrl.bind(this);
        this.linkClickHandler = this.linkClickHandler.bind(this);
        this.destroy = this.destroy.bind(this);

        if (this.createCslpTooltip()) {
            this.updateTooltipPosition();

            window.addEventListener("scroll", this.updateTooltipPosition);
            window.addEventListener("mouseover", this.addEditStyleOnHover);
        }
    }

    private createCslpTooltip(): boolean {
        if (
            !document.getElementById("cslp-tooltip") &&
            Config.get("editButton.enable")
        ) {
            const tooltip = document.createElement("button");
            this.tooltip = tooltip;

            this.tooltip.classList.add("cslp-tooltip");
            this.tooltip.setAttribute("data-test-id", "cs-cslp-tooltip");
            this.tooltip.id = "cslp-tooltip";

            window.document.body.insertAdjacentElement(
                "beforeend",
                this.tooltip
            );
            this.tooltipChild.singular = createSingularEditButton(
                this.scrollHandler
            );
            this.tooltipChild.multiple = createMultipleEditButton(
                this.scrollHandler,
                this.linkClickHandler
            );

            this.tooltip.appendChild(this.tooltipChild.singular);
            return true;
        }
        return false;
    }

    private updateTooltipPosition() {
        const elements = Config.get("elements") as {
            highlightedElement: HTMLElement | null;
        };

        if (!elements.highlightedElement || !this.tooltip) return false;

        const currentRectOfElement =
            elements.highlightedElement.getBoundingClientRect();
        const currentRectOfParentOfElement =
            this.tooltip.parentElement?.getBoundingClientRect();

        if (currentRectOfElement && currentRectOfParentOfElement) {
            const editButtonPosition = getEditButtonPosition(
                elements.highlightedElement,
                Config.get("editButton.position") as string
            );

            let upperBoundOfTooltip = editButtonPosition.upperBoundOfTooltip;
            const leftBoundOfTooltip = editButtonPosition.leftBoundOfTooltip;

            // if scrolled and element is still visible, make sure tooltip is also visible
            if (upperBoundOfTooltip < 0) {
                if (currentRectOfElement.top < 0)
                    upperBoundOfTooltip = currentRectOfElement.top;
                else upperBoundOfTooltip = 0;
            }

            this.tooltip.style.top = upperBoundOfTooltip + "px";
            this.tooltip.style.zIndex =
                elements.highlightedElement.style.zIndex || "200";
            this.tooltip.style.left = leftBoundOfTooltip + "px";

            if (this.tooltipChild.singular && this.tooltipChild.multiple) {
                if (
                    elements.highlightedElement.hasAttribute("href") &&
                    this.typeOfCurrentChild !== "multiple"
                ) {
                    this.tooltip.innerHTML = "";
                    this.tooltip.appendChild(this.tooltipChild.multiple);
                    this.typeOfCurrentChild = "multiple";
                } else if (this.typeOfCurrentChild !== "singular") {
                    this.tooltip.innerHTML = "";
                    this.tooltip.appendChild(this.tooltipChild.singular);
                    this.typeOfCurrentChild = "singular";
                }
            }
            return true;
        }

        return false;
    }

    private addEditStyleOnHover(e: MouseEvent) {
        const updateTooltipPosition: Parameters<typeof addCslpOutline>["1"] = ({
            cslpTag,
            highlightedElement,
        }) => {
            if (this.updateTooltipPosition()) {
                this.tooltip?.setAttribute("current-data-cslp", cslpTag);
                this.tooltip?.setAttribute(
                    "current-href",
                    highlightedElement.getAttribute("href") ?? ""
                );
            }
        };

        const windowType = Config.get(
            "windowType"
        ) as unknown as ILivePreviewWindowType;

        if (
            (windowType === ILivePreviewWindowType.PREVIEW ||
                windowType === ILivePreviewWindowType.INDEPENDENT) &&
            Config.get("editButton.enable")
        ) {
            addCslpOutline(e, updateTooltipPosition);
        }
    }

    private scrollHandler() {
        if (!this.tooltip) return;

        const cslpTag = this.tooltip.getAttribute("current-data-cslp");

        if (cslpTag) {
            const { content_type_uid, entry_uid, locale, fieldPathWithIndex } =
                extractDetailsFromCslp(cslpTag);

            if (inIframe()) {
                livePreviewPostMessage?.send("scroll", {
                    field: fieldPathWithIndex,
                    content_type_uid,
                    entry_uid,
                    locale,
                });
            } else {
                try {
                    // Redirect to Contentstack edit page
                    const redirectUrl = this.generateRedirectUrl(
                        content_type_uid,
                        locale,
                        entry_uid,
                        fieldPathWithIndex
                    );

                    window.open(redirectUrl, "_blank");
                } catch (error) {
                    PublicLogger.error(error);
                }
            }
        }
    }

    /**
     * Generates the redirect URL for editing a specific entry in the Live Preview SDK.
     * @param content_type_uid - The UID of the content type.
     * @param locale - The locale of the entry (default: "en-us").
     * @param entry_uid - The UID of the entry.
     * @param preview_field - The field to be previewed.
     * @returns The redirect URL for editing the entry.
     */
    private generateRedirectUrl(
        content_type_uid: string,
        locale = "en-us",
        entry_uid: string,
        preview_field: string
    ): string {
        const stackDetails = Config.get("stackDetails") as IStackDetails;
        const clientUrlParams = Config.get(
            "clientUrlParams"
        ) as IClientUrlParams;

        if (!stackDetails.apiKey) {
            throw `To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        apiKey: 'your-api-key'
                    },
                    ...
                })`;
        }

        if (!stackDetails.environment) {
            throw `To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        environment: 'Your-environment'
                    },
                    ...
                })`;
        }

        const protocol = String(clientUrlParams.protocol);
        const host = String(clientUrlParams.host);
        const port = String(clientUrlParams.port);
        const environment = String(stackDetails.environment);

        const urlHash = `!/stack/${
            stackDetails.apiKey
        }/content-type/${content_type_uid}/${
            locale ?? "en-us"
        }/entry/${entry_uid}/edit`;

        const url = new URL(`${protocol}://${host}`);
        url.port = port;
        url.hash = urlHash;
        url.searchParams.append("preview-field", preview_field);
        url.searchParams.append("preview-locale", locale ?? "en-us");
        url.searchParams.append("preview-environment", environment);

        return `${url.origin}/${url.hash}${url.search}`;
    }

    private linkClickHandler() {
        if (!this.tooltip) return;
        const hrefAttribute = this.tooltip.getAttribute("current-href");

        if (hrefAttribute) {
            window.location.assign(hrefAttribute);
        }
    }

    /**
     * Destroys the edit button by removing event listeners and removing the tooltip.
     */
    destroy(): void {
        window.removeEventListener("scroll", this.updateTooltipPosition);
        window.removeEventListener("mouseover", this.addEditStyleOnHover);
        this.tooltip?.remove();
    }
}
