import { VisualBuilder } from "..";
import { extractDetailsFromCslp } from "../../cslp";
import { getAddInstanceButtons } from "../generators/generateAddInstanceButtons";
import { addFocusOverlay } from "../generators/generateOverlay";
import { appendFocusedToolbar } from "../generators/generateToolbar";
import { hideHoverOutline } from "../listeners/mouseHover";
import { LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX, RIGHT_EDGE_BUFFER, TOOLBAR_EDGE_BUFFER, TOP_EDGE_BUFFER } from "./constants";
import getChildrenDirection from "./getChildrenDirection";
import getStyleOfAnElement from "./getStyleOfAnElement";

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
    resizeObserver: ResizeObserver;
}): void {
    const previousSelectedEditableDOM =
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
    hideHoverOutline(visualBuilderContainer);
    addFocusOverlay(previousSelectedEditableDOM, overlayWrapper);

    // update psuedo editable element if present
    const psuedoEditableElement = visualBuilderContainer.querySelector(
        ".visual-builder__pseudo-editable-element"
    ) as HTMLElement;
    if (psuedoEditableElement) {
        const styles = getStyleOfAnElement(editableElement);
        const styleString = Object.entries(styles).reduce(
            (acc, [key, value]) => {
                return `${acc}${key}:${value};`;
            },
            ""
        );
        psuedoEditableElement.style.cssText = styleString;
        psuedoEditableElement.style.visibility = "visible";
        psuedoEditableElement.style.position = "absolute";
        psuedoEditableElement.style.top = `${editableElement.offsetTop}px`;
        psuedoEditableElement.style.left = `${editableElement.offsetLeft}px`;
    }

    const cslp = editableElement?.getAttribute("data-cslp") || "";
    const fieldMetadata = extractDetailsFromCslp(cslp);

    const targetElementDimension = editableElement.getBoundingClientRect();
    if (targetElementDimension.width && targetElementDimension.height) {
        // re-add focussed toolbar
        if (focusedToolbar) {
            focusedToolbar.innerHTML = "";
        }
        appendFocusedToolbar(
            {
                editableElement: editableElement as HTMLElement,
                cslpData: cslp,
                fieldMetadata,
            },
            focusedToolbar as HTMLDivElement
        );
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
) {
    
    if (!focusOverlayWrapper) return;

    const selectedElement = VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM;

    if(!selectedElement)
        return;

    const selectedElementDimension = selectedElement.getBoundingClientRect();

    /**
     * Update the focus outline if it exists.
     */
    const focusOutline = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--outline"
    );

    if (focusOutline) {
        const focusOutlineDimension = focusOutline.getBoundingClientRect();
        if(!isSameRect(selectedElementDimension, focusOutlineDimension)){
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
    const focusedOverlayBottom = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--bottom"
    );
    const focusedOverlayLeft = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--left"
    );
    const focusedOverlayRight = focusOverlayWrapper.querySelector<HTMLDivElement>(
        ".visual-builder__overlay--right"
    );

    const distanceFromTop = selectedElementDimension.top + window.scrollY;

    if (focusedOverlayTop) {
        const dimension = focusedOverlayTop.getBoundingClientRect();
        if(dimension.height !== distanceFromTop) {
            focusedOverlayTop.style.height = `calc(${distanceFromTop}px)`;
        }
    }

    if (focusedOverlayBottom) {
        const dimension = focusedOverlayBottom.getBoundingClientRect();
        if(dimension.top !== selectedElementDimension.bottom ||
            dimension.height !== window.document.body.scrollHeight - selectedElementDimension.bottom - window.scrollY) {
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
        if(dimension.top + window.scrollY !== distanceFromTop ||
            dimension.height !== selectedElementDimension.height ||
            dimension.width !== selectedElementDimension.left) {
            focusedOverlayLeft.style.top = `${distanceFromTop}px`;
            focusedOverlayLeft.style.height = `${selectedElementDimension.height}px`;
            focusedOverlayLeft.style.width = `${selectedElementDimension.left}px`;
        }
    }

    if (focusedOverlayRight) {
        const dimension = focusedOverlayRight.getBoundingClientRect();
        if(dimension.left !== selectedElementDimension.right ||
            dimension.top + window.scrollY !== distanceFromTop ||
            dimension.height !== selectedElementDimension.height ||
            dimension.width !== document.documentElement.clientWidth - selectedElementDimension.right) {
                focusedOverlayRight.style.left = `${selectedElementDimension.right}px`;
                focusedOverlayRight.style.top = `${distanceFromTop}px`;
                focusedOverlayRight.style.height = `${selectedElementDimension.height}px`;
                focusedOverlayRight.style.width = `${
                    document.documentElement.clientWidth - selectedElementDimension.right
                }px`;
        }
    }

    /**
     * Update the focus toolbar if it exists.
     */

    if (focusedToolbar) {
        const targetElementRightEdgeOffset = window.scrollX + window.innerWidth - selectedElementDimension.left;
        const distanceFromTop =
            selectedElementDimension.top + window.scrollY - TOOLBAR_EDGE_BUFFER;
        // Position the toolbar at the top unless there's insufficient space or scrolling up is not possible (topmost element targetted).
        const adjustedDistanceFromTop =
            selectedElementDimension.top + window.scrollY < TOP_EDGE_BUFFER
                ? distanceFromTop + selectedElementDimension.height + TOP_EDGE_BUFFER
                : distanceFromTop;

        const distanceFromLeft =
            selectedElementDimension.left - LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX;
        const adjustedDistanceFromLeft = Math.max(
            distanceFromLeft,
            TOOLBAR_EDGE_BUFFER
        );

        if (targetElementRightEdgeOffset < RIGHT_EDGE_BUFFER &&
            ( focusedToolbar.style.justifyContent !== "flex-end" ||
            focusedToolbar.style.left !== `${
                selectedElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
            }px` )
        ) {
            // Overflow / Cutoff on right edge
            focusedToolbar.style.justifyContent = "flex-end";
            focusedToolbar.style.left = `${
                selectedElementDimension.right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX
            }px`;
        } else if (focusedToolbar.style.justifyContent !== "flex-start" ||
            focusedToolbar.style.left !== `${adjustedDistanceFromLeft}px`
        ) {
            focusedToolbar.style.justifyContent = "flex-start"; // default
            focusedToolbar.style.left = `${adjustedDistanceFromLeft}px`;
        }

        if(focusedToolbar.style.top !== `${adjustedDistanceFromTop}px`){
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
        const styles = getStyleOfAnElement(editableElement);
        const styleString = Object.entries(styles).reduce(
            (acc, [key, value]) => {
                return `${acc}${key}:${value};`;
            },
            ""
        );
        if (psuedoEditableElement &&
            (
                psuedoEditableElement.style.cssText !== styleString ||
                psuedoEditableElement.style.visibility !== "visible" ||
                psuedoEditableElement.style.position !== "absolute" ||
                psuedoEditableElement.style.top !== `${editableElement.offsetTop}px` ||
                psuedoEditableElement.style.left !== `${editableElement.offsetLeft}px`
            )
        ) {
            psuedoEditableElement.style.cssText = styleString;
            psuedoEditableElement.style.visibility = "visible";
            psuedoEditableElement.style.position = "absolute";
            psuedoEditableElement.style.top = `${editableElement.offsetTop}px`;
            psuedoEditableElement.style.left = `${editableElement.offsetLeft}px`;
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