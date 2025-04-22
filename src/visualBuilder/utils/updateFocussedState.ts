import { VisualBuilder } from "..";
import { extractDetailsFromCslp } from "../../cslp";
import { getAddInstanceButtons } from "../generators/generateAddInstanceButtons";
import {
    addFocusOverlay,
    hideFocusOverlay,
} from "../generators/generateOverlay";
import { hideHoverOutline } from "../listeners/mouseHover";
import {
    LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX,
    RIGHT_EDGE_BUFFER,
    TOOLBAR_EDGE_BUFFER,
    TOP_EDGE_BUFFER,
} from "./constants";
import getChildrenDirection from "./getChildrenDirection";
import { getPsuedoEditableElementStyles } from "./getPsuedoEditableStylesElement";
import getStyleOfAnElement from "./getStyleOfAnElement";

interface ToolbarPositionParams {
    focusedToolbar: HTMLElement | null;
    selectedElementDimension: DOMRect;
}
/**
 * Adjust the position of the field toolbar instead of clearing the innerhtml fo the focused toolbar.
 * By doing this, can avoid the re-rendering of the focus field toolbar.
 */
function positionToolbar({
    focusedToolbar,
    selectedElementDimension,
}: ToolbarPositionParams): void {
    if (focusedToolbar) {
        const targetElementRightEdgeOffset =
            window.scrollX + window.innerWidth - selectedElementDimension.left;
        const distanceFromTop =
            selectedElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;

        // Adjust top position based on the available space
        const adjustedDistanceFromTop =
            selectedElementDimension.top + window.scrollY < TOP_EDGE_BUFFER
                ? distanceFromTop +
                  selectedElementDimension.height +
                  TOP_EDGE_BUFFER
                : distanceFromTop;

        const distanceFromLeft =
            selectedElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
        const adjustedDistanceFromLeft = Math.max(
            distanceFromLeft,
            TOOLBAR_EDGE_BUFFER
        );

        // Handle right-edge overflow
        if (
            targetElementRightEdgeOffset < RIGHT_EDGE_BUFFER &&
            (focusedToolbar.style.justifyContent !== "flex-end" ||
                focusedToolbar.style.left !==
                    `${selectedElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`)
        ) {
            focusedToolbar.style.justifyContent = "flex-end";
            focusedToolbar.style.left = `${selectedElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`;
        } else if (
            focusedToolbar.style.justifyContent !== "flex-start" ||
            focusedToolbar.style.left !== `${adjustedDistanceFromLeft}px`
        ) {
            focusedToolbar.style.justifyContent = "flex-start"; // Default
            focusedToolbar.style.left = `${adjustedDistanceFromLeft}px`;
        }

        // Adjust top position if necessary
        if (focusedToolbar.style.top !== `${adjustedDistanceFromTop}px`) {
            focusedToolbar.style.top = `${adjustedDistanceFromTop}px`;
        }
    }
}

/**
 * This function can be used to re-draw/update the focussed state of an element.
 * The focussed state includes the overlay, psuedo-editable, toolbar, and multiple
 * instance add buttons. It is similar to handleBuilderInteraction but it does not
 * create new elements, it just updates the existing ones whenever possible.
 * NOTE: breakdown this function into multiple functions when the need arises
 */
export function updateFocussedState({
    editableElement,
    visualBuilderContainer,
    overlayWrapper,
    focusedToolbar,
    resizeObserver,
}: {
    editableElement: HTMLElement | null;
    visualBuilderContainer: HTMLDivElement | null;
    overlayWrapper: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
    resizeObserver: ResizeObserver | null;
}): void {
    let previousSelectedEditableDOM =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    if (
        !visualBuilderContainer ||
        !editableElement ||
        !previousSelectedEditableDOM ||
        !overlayWrapper
    ) {
        return;
    }

    // prefer data-cslp-unique-id when available else use data-cslp.
    // unique ID is added on click when multiple elements with same
    // data-cslp are found.
    const previousSelectedElementCslp = editableElement?.getAttribute("data-cslp") || "";
    const previousSelectedElementCslpUniqueId =
        previousSelectedEditableDOM?.getAttribute("data-cslp-unique-id");
    const newPreviousSelectedElement =
        document.querySelector(
            `[data-cslp-unique-id="${previousSelectedElementCslpUniqueId}"]`
        ) || document.querySelector(`[data-cslp="${previousSelectedElementCslp}"]`);
    if (!newPreviousSelectedElement && resizeObserver) {
        hideFocusOverlay({
            visualBuilderOverlayWrapper: overlayWrapper,
            focusedToolbar,
            visualBuilderContainer,
            resizeObserver,
            noTrigger: true,
        });
        return;
    }
    if (newPreviousSelectedElement !== previousSelectedEditableDOM) {
        previousSelectedEditableDOM = newPreviousSelectedElement as HTMLElement;
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;
    }

    hideHoverOutline(visualBuilderContainer);
    addFocusOverlay(previousSelectedEditableDOM, overlayWrapper);

    // update psuedo editable element if present
    const psuedoEditableElement = visualBuilderContainer.querySelector(
        ".visual-builder__pseudo-editable-element"
    ) as HTMLElement;
    if (psuedoEditableElement) {
        const styles = getPsuedoEditableElementStyles(editableElement);
        const styleString = Object.entries(styles).reduce(
            (acc, [key, value]) => {
                return `${acc}${key}:${value};`;
            },
            ""
        );
        psuedoEditableElement.style.cssText = styleString;
        // since we are copying styles from the editableEl
        // it will now have a visibility of hidden, which we added
        // when creating the pseudo editable element, so make the psuedo visible
        psuedoEditableElement.style.visibility = "visible";
    }

    const fieldMetadata = extractDetailsFromCslp(previousSelectedElementCslp);

    const targetElementDimension = editableElement.getBoundingClientRect();
    if (targetElementDimension.width && targetElementDimension.height) {
        const selectedElement =
            VisualBuilder.VisualBuilderGlobalState.value
                .previousSelectedEditableDOM;

        if (!selectedElement) return;
        // position the focused tool bar
        positionToolbar({
            focusedToolbar: focusedToolbar,
            selectedElementDimension: selectedElement.getBoundingClientRect(),
        });
    }

    // re-add multiple instance add buttons
    const buttons = getAddInstanceButtons(visualBuilderContainer);
    const parentCslpValue =
        fieldMetadata.multipleFieldMetadata?.parentDetails?.parentCslpValue;
    if (
        buttons &&
        parentCslpValue &&
        buttons.length > 1 &&
        buttons[0] &&
        buttons[1]
    ) {
        const [previousButton, nextButton] = buttons;
        const direction = getChildrenDirection(
            editableElement,
            parentCslpValue
        );
        const targetDOMDimension = editableElement.getBoundingClientRect();

        if (direction === "horizontal") {
            const middleHeight =
                targetDOMDimension.top +
                (targetDOMDimension.bottom - targetDOMDimension.top) / 2 +
                window.scrollY;
            previousButton.style.left = `${targetDOMDimension.left}px`;
            previousButton.style.top = `${middleHeight}px`;

            nextButton.style.left = `${targetDOMDimension.right}px`;
            nextButton.style.top = `${middleHeight}px`;
        } else if (direction === "vertical") {
            const middleWidth =
                targetDOMDimension.left +
                (targetDOMDimension.right - targetDOMDimension.left) / 2;
            previousButton.style.left = `${middleWidth}px`;
            previousButton.style.top = `${
                targetDOMDimension.top + window.scrollY
            }px`;

            nextButton.style.left = `${middleWidth}px`;
            nextButton.style.top = `${
                targetDOMDimension.bottom + window.scrollY
            }px`;
        }
    }
}

/**
 * This function is used to resize/reposition focus overlay and toolbar due to a
 * mutation in the DOM or due to changes in a different field (other than the focussed field).
 */
export function updateFocussedStateOnMutation(
    focusOverlayWrapper: HTMLDivElement | null,
    focusedToolbar: HTMLDivElement | null,
    visualBuilderContainer: HTMLDivElement | null,
    resizeObserver: ResizeObserver | null
) {
    if (!focusOverlayWrapper) return;

    let selectedElement =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    if (!selectedElement) return;

    const selectedElementCslp = selectedElement.getAttribute("data-cslp");
    const selectedElementCslpUniqueId = selectedElement?.getAttribute(
        "data-cslp-unique-id"
    );
    const newSelectedElement =
        document.querySelector(
            `[data-cslp-unique-id="${selectedElementCslpUniqueId}"]`
        ) || document.querySelector(`[data-cslp="${selectedElementCslp}"]`);
    if (!newSelectedElement && resizeObserver) {
        hideFocusOverlay({
            visualBuilderOverlayWrapper: focusOverlayWrapper,
            focusedToolbar,
            visualBuilderContainer,
            resizeObserver,
            noTrigger: true,
        });
        return;
    }

    if (newSelectedElement !== selectedElement) {
        selectedElement = newSelectedElement as HTMLElement;
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            selectedElement;
    }

    const selectedElementDimension = selectedElement.getBoundingClientRect();

    /**
     * Update the focus outline if it exists.
     */
    const focusOutline = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--outline"
    );

    if (focusOutline) {
        const focusOutlineDimension = focusOutline.getBoundingClientRect();
        if (!isSameRect(selectedElementDimension, focusOutlineDimension)) {
            focusOutline.style.top = `${selectedElementDimension.top + window.scrollY}px`;
            focusOutline.style.left = `${selectedElementDimension.left}px`;
            focusOutline.style.width = `${selectedElementDimension.width}px`;
            focusOutline.style.height = `${selectedElementDimension.height}px`;
        }
    }

    /**
     * Update the focus overlays if they exists.
     */

    const focusedOverlayTop = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--top"
    );
    const focusedOverlayBottom =
        focusOverlayWrapper.querySelector<HTMLDivElement>(
            ".visual-builder__overlay--bottom"
        );
    const focusedOverlayLeft =
        focusOverlayWrapper.querySelector<HTMLDivElement>(
            ".visual-builder__overlay--left"
        );
    const focusedOverlayRight =
        focusOverlayWrapper.querySelector<HTMLDivElement>(
            ".visual-builder__overlay--right"
        );

    const distanceFromTop = selectedElementDimension.top + window.scrollY;

    if (focusedOverlayTop) {
        const dimension = focusedOverlayTop.getBoundingClientRect();
        if (dimension.height !== distanceFromTop) {
            focusedOverlayTop.style.height = `calc(${distanceFromTop}px)`;
        }
    }

    if (focusedOverlayBottom) {
        const dimension = focusedOverlayBottom.getBoundingClientRect();
        if (
            dimension.top !== selectedElementDimension.bottom ||
            dimension.height !==
                window.document.body.scrollHeight -
                    selectedElementDimension.bottom -
                    window.scrollY
        ) {
            focusedOverlayBottom.style.top = `${
                selectedElementDimension.bottom + window.scrollY
            }px`;
            focusedOverlayBottom.style.height = `${
                window.document.body.scrollHeight -
                selectedElementDimension.bottom -
                window.scrollY
            }px`;
        }
    }

    if (focusedOverlayLeft) {
        const dimension = focusedOverlayLeft.getBoundingClientRect();
        if (
            dimension.top + window.scrollY !== distanceFromTop ||
            dimension.height !== selectedElementDimension.height ||
            dimension.width !== selectedElementDimension.left
        ) {
            focusedOverlayLeft.style.top = `${distanceFromTop}px`;
            focusedOverlayLeft.style.height = `${selectedElementDimension.height}px`;
            focusedOverlayLeft.style.width = `${selectedElementDimension.left}px`;
        }
    }

    if (focusedOverlayRight) {
        const dimension = focusedOverlayRight.getBoundingClientRect();
        if (
            dimension.left !== selectedElementDimension.right ||
            dimension.top + window.scrollY !== distanceFromTop ||
            dimension.height !== selectedElementDimension.height ||
            dimension.width !==
                document.documentElement.clientWidth -
                    selectedElementDimension.right
        ) {
            focusedOverlayRight.style.left = `${selectedElementDimension.right}px`;
            focusedOverlayRight.style.top = `${distanceFromTop}px`;
            focusedOverlayRight.style.height = `${selectedElementDimension.height}px`;
            focusedOverlayRight.style.width = `${
                document.documentElement.clientWidth -
                selectedElementDimension.right
            }px`;
        }
    }

    /**
     * Update the focus toolbar if it exists.
     */

    if (focusedToolbar) {
        const targetElementRightEdgeOffset =
            window.scrollX + window.innerWidth - selectedElementDimension.left;
        const distanceFromTop =
            selectedElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;
        // Position the toolbar at the top unless there's insufficient space or scrolling up is not possible (topmost element targetted).
        const adjustedDistanceFromTop =
            selectedElementDimension.top + window.scrollY < TOP_EDGE_BUFFER
                ? distanceFromTop +
                  selectedElementDimension.height +
                  TOP_EDGE_BUFFER
                : distanceFromTop;

        const distanceFromLeft =
            selectedElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
        const adjustedDistanceFromLeft = Math.max(
            distanceFromLeft,
            TOOLBAR_EDGE_BUFFER
        );

        if (
            targetElementRightEdgeOffset < RIGHT_EDGE_BUFFER &&
            (focusedToolbar.style.justifyContent !== "flex-end" ||
                focusedToolbar.style.left !==
                    `${
                        selectedElementDimension.right +
                        LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
                    }px`)
        ) {
            // Overflow / Cutoff on right edge
            focusedToolbar.style.justifyContent = "flex-end";
            focusedToolbar.style.left = `${
                selectedElementDimension.right +
                LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
            }px`;
        } else if (
            focusedToolbar.style.justifyContent !== "flex-start" ||
            focusedToolbar.style.left !== `${adjustedDistanceFromLeft}px`
        ) {
            focusedToolbar.style.justifyContent = "flex-start"; // default
            focusedToolbar.style.left = `${adjustedDistanceFromLeft}px`;
        }

        if (focusedToolbar.style.top !== `${adjustedDistanceFromTop}px`) {
            focusedToolbar.style.top = `${adjustedDistanceFromTop}px`;
        }
    }

    /**
     * Update the pseudo-editable if it exists.
     */

    if (visualBuilderContainer) {
        const psuedoEditableElement = visualBuilderContainer.querySelector(
            ".visual-builder__pseudo-editable-element"
        ) as HTMLElement;
        const editableElement = selectedElement as HTMLElement;
        const styles = getPsuedoEditableElementStyles(editableElement);
        const styleString = Object.entries(styles).reduce(
            (acc, [key, value]) => {
                return `${acc}${key}:${value};`;
            },
            ""
        );
        if (
            psuedoEditableElement &&
            (psuedoEditableElement.style.cssText !== styleString ||
                psuedoEditableElement.style.visibility !== "visible")
        ) {
            psuedoEditableElement.style.cssText = styleString;
            // since we are copying styles from the editableEl
            // it will now have a visibility of hidden, which we added
            // when creating the pseudo editable element, so make the psuedo visible
            psuedoEditableElement.style.visibility = "visible";
        }
    }
}

function isSameRect(rect1: DOMRect, rect2: DOMRect) {
    return (
        rect1.top === rect2.top &&
        rect1.left === rect2.left &&
        rect1.width === rect2.width &&
        rect1.height === rect2.height
    );
}
