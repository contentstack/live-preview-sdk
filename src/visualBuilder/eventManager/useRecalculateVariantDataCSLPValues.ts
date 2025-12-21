import { VisualBuilder } from "..";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../../livePreview/eventManager/livePreviewEventManager.constant";
import { DATA_CSLP_ATTR_SELECTOR } from "../utils/constants";
import { visualBuilderStyles } from "../visualBuilder.style";

const VARIANT_UPDATE_DELAY_MS: Readonly<number> = 8000;

type OnAudienceModeVariantPatchUpdate = {
    highlightVariantFields: boolean;
    expectedCSLPValues: Record<"variant" | "base", string>;
};

/**
 * Registers a post message event listener for updating the variant / base classes in the live preview for audience mode.
 */
export function useRecalculateVariantDataCSLPValues(): void {
    livePreviewPostMessage?.on<OnAudienceModeVariantPatchUpdate>(
        LIVE_PREVIEW_POST_MESSAGE_EVENTS.VARIANT_PATCH,
        (event) => {
            if (VisualBuilder.VisualBuilderGlobalState.value.audienceMode) {
                updateVariantClasses(event.data);
            }
        }
    );
}
function updateVariantClasses({
    highlightVariantFields,
    expectedCSLPValues,
}: OnAudienceModeVariantPatchUpdate): void {
    const variant = VisualBuilder.VisualBuilderGlobalState.value.variant;
    const observers: MutationObserver[] = [];

    // Helper function to update element classes
    const updateElementClasses = (
        element: HTMLElement,
        dataCslp: string,
        observer?: MutationObserver
    ) => {
        if (!dataCslp) return;

        if (
            dataCslp.startsWith("v2:") &&
            !element.classList.contains("visual-builder__variant-field")
        ) {
            if (element.classList.contains("visual-builder__base-field")) {
                element.classList.remove("visual-builder__base-field");
            }
            if (highlightVariantFields) {
                element.classList.add(
                    visualBuilderStyles()["visual-builder__variant-field"],
                    "visual-builder__variant-field"
                );
            } else {
                element.classList.add("visual-builder__variant-field");
            }
        } else if (
            !dataCslp.startsWith("v2:") &&
            element.classList.contains("visual-builder__variant-field")
        ) {
            element.classList.remove(
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__variant-field"
            );
            element.classList.add("visual-builder__base-field");
        } else if (
            dataCslp.startsWith("v2:") &&
            variant &&
            !dataCslp.includes(variant) &&
            element.classList.contains("visual-builder__variant-field")
        ) {
            element.classList.remove(
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__variant-field"
            );
            element.classList.add("visual-builder__disabled-variant-field");
        }
        if (!observer) return;
        // Disconnect this observer after processing
        observer.disconnect();
        const index = observers.indexOf(observer);
        if (index > -1) {
            observers.splice(index, 1);
        }
    };

    const addElementClasses = (element: HTMLElement) => {
        const dataCslp = element.getAttribute(DATA_CSLP_ATTR_SELECTOR);

        if (!dataCslp) {
            //recursive call for child nodes
            element.childNodes.forEach((child) => {
                if (child instanceof HTMLElement) {
                    addElementClasses(child);
                }
            });
            return;
        }
        //if element might have been updated by another observer
        if (
            dataCslp.startsWith("v2:") &&
            element.classList.contains("visual-builder__variant-field")
        ) {
            return;
        }
        // if element has not given variant/base class
        if (
            dataCslp.startsWith("v2:") &&
            !element.classList.contains("visual-builder__variant-field")
        ) {
            if (element.classList.contains("visual-builder__base-field")) {
                element.classList.remove("visual-builder__base-field");
            }
            if (highlightVariantFields) {
                element.classList.add(
                    visualBuilderStyles()["visual-builder__variant-field"],
                    "visual-builder__variant-field"
                );
            } else {
                element.classList.add("visual-builder__variant-field");
            }
        } else if (!dataCslp.startsWith("v2:")) {
            if (element.classList.contains("visual-builder__variant-field")) {
                element.classList.remove(
                    visualBuilderStyles()["visual-builder__variant-field"],
                    "visual-builder__variant-field"
                );
            }
            element.classList.add("visual-builder__base-field");
        }

        //recursive call for child nodes
        element.childNodes.forEach((child) => {
            if (child instanceof HTMLElement) {
                addElementClasses(child);
            }
        });
    };

    // Create a separate observer for each element
    const elementsWithCslp = document.querySelectorAll(
        `[${DATA_CSLP_ATTR_SELECTOR}]`
    );
    elementsWithCslp.forEach((elementNode) => {
        const element = elementNode as HTMLElement;
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    (mutation.type === "attributes" &&
                        mutation.attributeName === DATA_CSLP_ATTR_SELECTOR) ||
                    mutation.type === "childList"
                ) {
                    if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach((node) => {
                            if (node instanceof HTMLElement) {
                                addElementClasses(node);
                            }
                        });
                    }
                    const dataCslp = element.getAttribute(
                        DATA_CSLP_ATTR_SELECTOR
                    );
                    updateElementClasses(element, dataCslp || "", observer);
                }
            });
        });

        observers.push(observer);
        observer.observe(element, {
            attributes: true,
            childList: true, // Observe direct children
            subtree: true,
        });
    });

    setTimeout(() => {
        if (observers.length > 0) {
            observers.forEach((observer) => observer.disconnect());
            observers.length = 0;
        }
    }, VARIANT_UPDATE_DELAY_MS);
}
