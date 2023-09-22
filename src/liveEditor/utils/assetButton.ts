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
    const dimension = targetElement.getBoundingClientRect();
    const replaceButton = document.createElement("button");

    replaceButton.addEventListener("click", onClickCallback);
    replaceButton.classList.add("visual-editor__replace-button");
    replaceButton.setAttribute("data-testid", "visual-editor-replace-asset");
    replaceButton.innerHTML = `Replace Asset`;
    replaceButton.style.top = `${dimension.bottom + window.scrollY - 30}px`;
    replaceButton.style.right = `${window.innerWidth - dimension.right}px`;

    return replaceButton;
}
