import { render } from "preact";
import ReplaceAssetButtonComponent from "../components/replaceAssetButton";

/**
 * Removes all existing replace asset buttons from the provided visual builder wrapper element.
 * @param visualBuilderContainer - The visual builder wrapper element to remove replace asset buttons from.
 */
export function removeReplaceAssetButton(
    visualBuilderContainer: HTMLDivElement | null
): void {
    if (!visualBuilderContainer) {
        return;
    }

    const existingReplaceButtons =
        visualBuilderContainer.getElementsByClassName(
            "visual-builder__replace-button"
        );

    for (const existingReplaceButton of Array.from(existingReplaceButtons)) {
        existingReplaceButton.remove();
    }
}

/**
 * Generates a replace asset button element that can be appended to the DOM.
 * @param targetElement - The target element to attach the button to.
 * @param onClickCallback - The callback function to execute when the button is clicked.
 * @returns The generated HTMLButtonElement.
 */
export function generateReplaceAssetButton(
    targetElement: Element,
    onClickCallback: (event: any) => void
): HTMLButtonElement {
    const isReplaceButtonAlreadyPresent = document.querySelector(
        ".visual-builder__replace-button"
    ) as HTMLButtonElement;
    if (isReplaceButtonAlreadyPresent) {
        return isReplaceButtonAlreadyPresent;
    }

    const visualBuilderContainer = document.querySelector(
        ".visual-builder__focused-toolbar__button-group"
    );
    const wrapper = document.createDocumentFragment();
    render(
        <ReplaceAssetButtonComponent
            targetElement={targetElement}
            onClickCallback={onClickCallback}
        />,
        wrapper
    );

    if (visualBuilderContainer) {
        const childrenCount = visualBuilderContainer.children.length;
        if (childrenCount === 3) {
            visualBuilderContainer.insertBefore(
                wrapper,
                visualBuilderContainer.children[2]
            );
        } else {
            visualBuilderContainer.appendChild(wrapper);
        }
    }

    const replaceButton = document.querySelector(
        ".visual-builder__replace-button"
    ) as HTMLButtonElement;

    return replaceButton;
}
