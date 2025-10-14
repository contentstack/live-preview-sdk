import { VisualBuilder } from "..";
import { extractDetailsFromCslp } from "../../cslp";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { getFieldData } from "../utils/getFieldData";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { hideFocusOverlay } from "../generators/generateOverlay";
import { handleBuilderInteraction } from "../listeners/mouseClick";

/**
 * Revalidates field data and schema after variant linking operations.
 * Unfocuses the selected element, revalidates data, and then reselects it.
 */
async function handleRevalidateFieldData(): Promise<void> {
    const focusedElement =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    const hoveredElement =
        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM;

    // Store element identifiers for refocusing
    const elementCslp = focusedElement?.getAttribute("data-cslp");
    const elementCslpUniqueId =
        focusedElement?.getAttribute("data-cslp-unique-id") || null;
    const shouldRefocus = !!focusedElement;

    try {
        // Step 1: Unfocus the current element
        if (shouldRefocus) {
            await unfocusElement();
        }

        // Step 2: Revalidate field data
        const targetElement = hoveredElement || focusedElement;

        if (targetElement) {
            const cslp = targetElement.getAttribute("data-cslp");
            if (cslp) {
                const fieldMetadata = extractDetailsFromCslp(cslp);

                // Try to revalidate specific field schema and data
                try {
                    // Clear the entire content type schema from cache to force fresh fetch
                    FieldSchemaMap.clearContentTypeSchema(
                        fieldMetadata.content_type_uid
                    );
                } catch (fieldError) {
                    console.warn(
                        "Failed to revalidate content type:",
                        fieldMetadata.content_type_uid,
                        fieldError
                    );
                }
            }
        }

        // Fallback 1: Clear all field schema cache
        try {
            FieldSchemaMap.clear();
            return;
        } catch (clearError) {
            console.error("Failed to clear field schema cache:", clearError);
        }

        // Fallback 2: Refresh the entire iframe
        window.location.reload();
    } catch (error) {
        console.error("Error handling revalidate field data:", error);
        // Final fallback - refresh the page
        window.location.reload();
    } finally {
        // Step 3: Refocus the element if we had one focused before
        if (shouldRefocus && elementCslp) {
            await refocusElement(elementCslp, elementCslpUniqueId);
        }
    }
}

/**
 * Unfocuses the currently selected element and clears focus state
 */
async function unfocusElement(): Promise<void> {
    const { visualBuilderContainer, overlayWrapper, focusedToolbar } =
        getVisualBuilderElements();

    if (!visualBuilderContainer || !overlayWrapper) return;

    const dummyResizeObserver = new ResizeObserver(() => {});

    // Hide focus overlay (cleanIndividualFieldResidual needs previousSelectedEditableDOM)
    hideFocusOverlay({
        visualBuilderContainer,
        visualBuilderOverlayWrapper: overlayWrapper,
        focusedToolbar,
        resizeObserver: dummyResizeObserver,
        noTrigger: true,
    });

    // Clear global state after cleanup
    VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
        null;
    VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;
}

/**
 * Refocuses an element by its CSLP identifier
 */
async function refocusElement(
    cslp: string,
    uniqueId: string | null
): Promise<void> {
    try {
        // Find the element (prefer unique ID, fallback to CSLP)
        const elementToRefocus =
            (uniqueId &&
                document.querySelector(
                    `[data-cslp-unique-id="${uniqueId}"]`
                )) ||
            document.querySelector(`[data-cslp="${cslp}"]`);

        if (!elementToRefocus) return;

        const { visualBuilderContainer, overlayWrapper, focusedToolbar } =
            getVisualBuilderElements();

        if (!visualBuilderContainer || !overlayWrapper) return;

        // Create synthetic click event
        const syntheticEvent = new MouseEvent("click", {
            bubbles: true,
            cancelable: true,
        });
        Object.defineProperty(syntheticEvent, "target", {
            value: elementToRefocus,
            enumerable: true,
        });

        // Refocus using handleBuilderInteraction
        await handleBuilderInteraction({
            event: syntheticEvent,
            previousSelectedEditableDOM: null,
            visualBuilderContainer,
            overlayWrapper,
            focusedToolbar,
            resizeObserver: new ResizeObserver(() => {}),
        });
    } catch (error) {
        console.warn("Could not refocus element after revalidation:", error);
    }
}

/**
 * Gets the main visual builder DOM elements
 */
function getVisualBuilderElements() {
    return {
        visualBuilderContainer: document.querySelector(
            ".visual-builder__container"
        ) as HTMLDivElement | null,
        overlayWrapper: document.querySelector(
            ".visual-builder__overlay__wrapper"
        ) as HTMLDivElement | null,
        focusedToolbar: document.querySelector(
            ".visual-builder__focused-toolbar"
        ) as HTMLDivElement | null,
    };
}

export function useRevalidateFieldDataPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REVALIDATE_FIELD_DATA,
        handleRevalidateFieldData
    );
}
