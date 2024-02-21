import { render } from "preact";
import ReplaceAssetButtonComponent from "../components/replaceAssetButton";

/**
 * Removes all existing replace asset buttons from the provided visual editor wrapper element.
 * @param visualEditorWrapper - The visual editor wrapper element to remove replace asset buttons from.
 */
export function removeReplaceAssetButton(
    visualEditorWrapper: HTMLDivElement | null
): void {
    if (!visualEditorWrapper) {
        return;
    }

    const existingReplaceButtons = visualEditorWrapper.getElementsByClassName(
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
    onClickCallback: (event: MouseEvent) => void
): HTMLButtonElement {
   
    const visualEditorWrapper = document.querySelector(".visual-editor__container");
    const wrapper = document.createDocumentFragment();
    render(<ReplaceAssetButtonComponent targetElement={targetElement} onClickCallback={onClickCallback}/>, wrapper);
    
    visualEditorWrapper?.appendChild(wrapper);

    const replaceButton = document.querySelector(".visual-editor__replace-button") as HTMLButtonElement;

    return replaceButton;
}
