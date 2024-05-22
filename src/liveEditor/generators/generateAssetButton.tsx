import { render } from "preact";
import ReplaceAssetButtonComponent from "../components/replaceAssetButton";

/**
 * Removes all existing replace asset buttons from the provided visual editor wrapper element.
 * @param visualEditorContainer - The visual editor wrapper element to remove replace asset buttons from.
 */
export function removeReplaceAssetButton(
    visualEditorContainer: HTMLDivElement | null
): void {
    if (!visualEditorContainer) {
        return;
    }

    const existingReplaceButtons = visualEditorContainer.getElementsByClassName(
        "visual-editor__replace-button"
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
        ".visual-editor__replace-button"
    ) as HTMLButtonElement;
    if (isReplaceButtonAlreadyPresent) {
        return isReplaceButtonAlreadyPresent;
    }

    const visualEditorContainer = document.querySelector(
        ".visual-editor__focused-toolbar__button-group"
    );
    const wrapper = document.createDocumentFragment();
    render(
        <ReplaceAssetButtonComponent
            targetElement={targetElement}
            onClickCallback={onClickCallback}
        />,
        wrapper
    );
    
    if (visualEditorContainer) {
        const childrenCount = visualEditorContainer.children.length;
        if (childrenCount === 3) {
            visualEditorContainer.insertBefore(wrapper, visualEditorContainer.children[2]);
        } else {
            visualEditorContainer.appendChild(wrapper);
        }
    }

    const replaceButton = document.querySelector(
        ".visual-editor__replace-button"
    ) as HTMLButtonElement;

    return replaceButton;
}
