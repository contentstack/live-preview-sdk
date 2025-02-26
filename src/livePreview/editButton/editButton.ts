import { effect } from "@preact/signals";
import { inIframe } from "../../common/inIframe";
import Config from "../../configManager/configManager";
import { addCslpOutline, extractDetailsFromCslp } from "../../cslp";
import { cslpTagStyles } from "./editButton.style";
import { PublicLogger } from "../../logger/logger";
import {
    type IEditButtonPosition,
    ILivePreviewWindowType,
} from "../../types/types";
import livePreviewPostMessage from "../eventManager/livePreviewEventManager";
import { EDIT_BUTTON_TOOLTIP_ID } from "./editButton.constant";
import { isOpeningInTimeline } from "../../utils";

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
    multipleDiv.classList.add(cslpTagStyles()["multiple"]);

    return multipleDiv;
};

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

export function shouldRenderEditButton(): boolean {
    const config = Config.get();

    if (!config.editButton.enable) {
        if (config.editButton.enable === undefined)
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
            config.editButton.includeByQueryParameter !== false
        )
            return cslpButtonQueryValue === "false" ? false : true;
    } catch (error) {
        PublicLogger.error(error);
    }

    const iFrameCheck = inIframe();

    // case outside live preview
    if (
        !iFrameCheck &&
        config.editButton.exclude?.find(
            (exclude) => exclude === "outsideLivePreviewPortal"
        )
    ) {
        return false;
    }

    // case if inside live preview
    if (
        iFrameCheck &&
        config.editButton.exclude?.find(
            (exclude) => exclude === "insideLivePreviewPortal"
        )
    ) {
        return false;
    } else if (iFrameCheck) {
        // case if inside visual builder
        if (config.windowType === "builder") {
            return false;
        }

        // case if independent site
        return true;
    }

    // Priority list => 1. cslpEditButton query value 2.  Inside live preview  3. renderCslpButtonByDefault value selected by user
    return true;
}

export function toggleEditButtonElement() {
    const render = shouldRenderEditButton();
    const exists = doesEditButtonExist();

    if (render && !exists) {
        LivePreviewEditButton.livePreviewEditButton =
            new LivePreviewEditButton();
    } else if (!render && exists) {
        LivePreviewEditButton.livePreviewEditButton?.destroy();
    }
}

export function doesEditButtonExist() {
    return document.getElementById(EDIT_BUTTON_TOOLTIP_ID) !== null;
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
    static livePreviewEditButton: LivePreviewEditButton | null = null;

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
        const editButton = Config.get().editButton;

        if (
            !document.getElementById(EDIT_BUTTON_TOOLTIP_ID) &&
            editButton.enable &&
            shouldRenderEditButton()
        ) {
            const tooltip = document.createElement("button");
            this.tooltip = tooltip;

            this.tooltip.classList.add(cslpTagStyles()["cslp-tooltip"]);
            this.tooltip.setAttribute("data-test-id", "cs-cslp-tooltip");
            this.tooltip.id = EDIT_BUTTON_TOOLTIP_ID;

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
        if (!document.getElementById("cslp-tooltip")) {
            this.createCslpTooltip();
        }
        const editButton = Config.get().editButton;
        const elements = Config.get().elements;

        if (!elements.highlightedElement || !this.tooltip) return false;

        const currentRectOfElement =
            elements.highlightedElement.getBoundingClientRect();
        const currentRectOfParentOfElement =
            this.tooltip.parentElement?.getBoundingClientRect();

        if (currentRectOfElement && currentRectOfParentOfElement) {
            const editButtonPosition = getEditButtonPosition(
                elements.highlightedElement as HTMLElement,
                editButton.position
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
        const updateStyles = this.shouldUpdateStyles(e);
        // Checks whether the mouse pointer is within the safe zone of the
        // element which was hovered on, since it also returns undefined when the
        // above can't be determined we can still add styles
        const shouldRedraw =
            typeof updateStyles === "undefined" ? true : updateStyles;
        if (!shouldRedraw) {
            return;
        }
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

        const editButton = Config.get().editButton;
        const windowType = Config.get().windowType;

        if (
            (windowType === ILivePreviewWindowType.PREVIEW ||
                windowType === ILivePreviewWindowType.INDEPENDENT) &&
            editButton.enable
        ) {
            addCslpOutline(e, updateTooltipPosition);
        }
    }

    /**
     * Find first element with cslp on the event composed path,
     * do safe zone calculation for an element based on its
     * width and height, and return true if mouse pointer is
     * within the safe zone. Returns undefined when this cannot
     * be determined.
     */
    private shouldUpdateStyles(e: MouseEvent) {
        const SAFE_ZONE_RATIO = 0.1;
        const MAX_SAFE_ZONE_DISTANCE = 30;
        const tooltipPos = this.tooltip?.getBoundingClientRect();
        if (!tooltipPos) {
            return undefined;
        }
        if (!(tooltipPos.x > 0) || !(tooltipPos.y > 0)) {
            return undefined;
        }
        const editButton = Config.get().editButton;
        const isTop = editButton.position?.includes("top");
        const isLeft = editButton.position?.includes("left");
        const isBottom = editButton.position?.includes("bottom");
        const isVertical = isTop || isBottom;
        const cslpElement = e.composedPath().find((target) => {
            const element = target as HTMLElement;
            if (element.nodeName === "BODY") {
                return false;
            }
            if (typeof element?.hasAttribute !== "function") {
                return false;
            }
            return element.hasAttribute("data-cslp");
        });
        if (!cslpElement) {
            return undefined;
        }
        const element = cslpElement as HTMLElement;
        const elementRect = element.getBoundingClientRect();
        let safeZoneDistance = isVertical
            ? // if vertical positioning ("top"/"bottom")
              // button is rendered along the width
              elementRect.width * SAFE_ZONE_RATIO
            : // button is rendered along the height
              elementRect.height * SAFE_ZONE_RATIO;
        safeZoneDistance =
            safeZoneDistance > MAX_SAFE_ZONE_DISTANCE
                ? MAX_SAFE_ZONE_DISTANCE
                : safeZoneDistance;

        const tooltipX2 = tooltipPos.x + tooltipPos.width;
        const tooltipY2 = tooltipPos.y + tooltipPos.height;
        const safeX1 = tooltipPos.x - safeZoneDistance;
        const safeX2 = tooltipX2 + safeZoneDistance;
        const safeY1 = tooltipPos.y - safeZoneDistance;
        const safeY2 = tooltipY2 + safeZoneDistance;

        if (isTop || isBottom) {
            const verticalSafeDistance = isTop
                ? Math.abs(tooltipY2 - e.clientY)
                : Math.abs(tooltipPos.y - e.clientY);
            const isInSafeZone =
                e.clientX > safeX1 &&
                e.clientX < safeX2 &&
                verticalSafeDistance < safeZoneDistance;
            if (isInSafeZone) {
                return false;
            }
        } else {
            const horizontalSafeDistance = isLeft
                ? Math.abs(tooltipX2 - e.clientX)
                : Math.abs(tooltipPos.x - e.clientX);

            const isInSafeZone =
                e.clientY > safeY1 &&
                e.clientY < safeY2 &&
                horizontalSafeDistance < safeZoneDistance;
            if (isInSafeZone) {
                return false;
            }
        }
        return true;
    }

    private scrollHandler() {
        if (!this.tooltip) return;

        const cslpTag = this.tooltip.getAttribute("current-data-cslp");

        if (cslpTag) {
            const {
                content_type_uid,
                entry_uid,
                locale,
                variant,
                fieldPathWithIndex,
            } = extractDetailsFromCslp(cslpTag);

            if (inIframe()) {
                livePreviewPostMessage?.send("scroll", {
                    field: fieldPathWithIndex,
                    content_type_uid,
                    entry_uid,
                    variant,
                    locale,
                });
            } else {
                try {
                    // Redirect to Contentstack edit page
                    const redirectUrl = this.generateRedirectUrl(
                        content_type_uid,
                        locale,
                        entry_uid,
                        variant,
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
        variant: string | undefined,
        preview_field: string
    ): string {
        const config = Config.get();

        if (!config.stackDetails.apiKey) {
            throw `To use edit tags, you must provide the stack API key. Specify the API key while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        apiKey: 'your-api-key'
                    },
                    ...
                })`;
        }

        if (!config.stackDetails.environment) {
            throw `To use edit tags, you must provide the preview environment. Specify the preview environment while initializing the Live Preview SDK.

                ContentstackLivePreview.init({
                    ...,
                    stackDetails: {
                        environment: 'Your-environment'
                    },
                    ...
                })`;
        }

        const protocol = String(config.clientUrlParams.protocol);
        const host = String(config.clientUrlParams.host);
        const port = String(config.clientUrlParams.port);
        const environment = String(config.stackDetails.environment);
        const branch = String(config.stackDetails.branch || "main");

        let urlHash = `!/stack/${
            config.stackDetails.apiKey
        }/content-type/${content_type_uid}/${
            locale ?? "en-us"
        }/entry/${entry_uid}`;

        if (variant) {
            urlHash += `/variant/${variant}/edit`;
        } else {
            urlHash += `/edit`;
        }

        const url = new URL(`${protocol}://${host}`);
        url.port = port;
        url.hash = urlHash;
        if (config.stackDetails.branch) {
            url.searchParams.append("branch", branch);
        }
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

effect(function handleWindowTypeChange() {
    // we need to specify when to run this effect.
    // here, we run it when the value of windowType changes
    if (typeof window === "undefined") return;
    Config.get().windowType;
    if (LivePreviewEditButton && !isOpeningInTimeline()) {
        toggleEditButtonElement();
    }
});
