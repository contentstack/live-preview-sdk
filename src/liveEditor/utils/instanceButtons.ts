const plusIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">\n<path d="M10.4688 4.375C10.4688 4.11612 10.259 3.90625 10.0001 3.90625C9.74121 3.90625 9.53135 4.11612 9.53135 4.375V9.27307H4.37402C4.11514 9.27307 3.90527 9.48294 3.90527 9.74182C3.90527 10.0007 4.11514 10.2106 4.37402 10.2106H9.53135V15.625C9.53135 15.8839 9.74121 16.0937 10.0001 16.0937C10.259 16.0937 10.4688 15.8839 10.4688 15.625V10.2106H15.6259C15.8847 10.2106 16.0946 10.0007 16.0946 9.74182C16.0946 9.48294 15.8847 9.27307 15.6259 9.27307H10.4688V4.375Z" fill="#475161"/>\n</svg>`;

/**
 * Generates a button element, when clicked, triggers the provided callback function.
 * @param onClickCallback - The function to be called when the button is clicked.
 * @returns The generated button element.
 */
export function generateAddInstanceButton(
    onClickCallback: (event: MouseEvent) => void
): HTMLButtonElement {
    const button = document.createElement("button");
    button.innerHTML = plusIcon;
    button.classList.add("visual-editor__add-button");
    button.setAttribute("data-testid", "visual-editor-add-instance-button");
    button.addEventListener("click", onClickCallback);
    return button;
}

export function getAddInstanceButtons(
    visualEditorWrapper: HTMLDivElement,
    getAllButtons: true
): HTMLButtonElement[];

export function getAddInstanceButtons(
    visualEditorWrapper: HTMLDivElement,
    getAllButtons?: false
): [HTMLButtonElement, HTMLButtonElement] | null;

/**
 * Returns an array of HTMLButtonElement instances that can be used to add new instances to the visual editor.
 * @param visualEditorWrapper - The HTMLDivElement that contains the visual editor.
 * @param getAllButtons - If true, returns all add instance buttons. If false, returns only the previous and next buttons.
 * @returns An array of HTMLButtonElement instances or null if there are less than 2 buttons.
 */
export function getAddInstanceButtons(
    visualEditorWrapper: HTMLDivElement,
    getAllButtons = false
): HTMLButtonElement[] | [HTMLButtonElement, HTMLButtonElement] | null {
    const buttons = visualEditorWrapper.getElementsByClassName(
        "visual-editor__add-button"
    );

    if (getAllButtons) {
        return Array.from(buttons) as HTMLButtonElement[];
    }

    if (buttons.length < 2) {
        return null;
    }

    const previousButton = buttons[0] as HTMLButtonElement;
    const nextButton = buttons[1] as HTMLButtonElement;

    return [previousButton, nextButton];
}
