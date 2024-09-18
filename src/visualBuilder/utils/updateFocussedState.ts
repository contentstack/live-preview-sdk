import { VisualBuilder } from "..";
import { extractDetailsFromCslp } from "../../cslp";
import { getAddInstanceButtons } from "../generators/generateAddInstanceButtons";
import { addFocusOverlay } from "../generators/generateOverlay";
import { appendFocusedToolbar } from "../generators/generateToolbar";
import { hideHoverOutline } from "../listeners/mouseHover";
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
