import { render } from "preact";
import AddInstanceButtonComponent from "../components/addInstanceButton";

/**
 * Generates a button element, when clicked, triggers the provided callback function.
 * @param onClickCallback - The function to be called when the button is clicked.
 * @returns The generated button element.
 */
export function generateAddInstanceButton(
    onClickCallback: (event: MouseEvent) => void
): HTMLButtonElement {
    const wrapper = document.createDocumentFragment();

    render(
        <AddInstanceButtonComponent onClickCallback={onClickCallback} />,
        wrapper
    );

    return wrapper as unknown as HTMLButtonElement;
}

export function getAddInstanceButtons(
    visualEditorContainer: HTMLDivElement,
    getAllButtons: true
): HTMLButtonElement[];

export function getAddInstanceButtons(
    visualEditorContainer: HTMLDivElement,
    getAllButtons?: false
): [HTMLButtonElement, HTMLButtonElement] | null;

/**
 * Returns an array of HTMLButtonElement instances that can be used to add new instances to the visual editor.
 * @param visualEditorContainer - The HTMLDivElement that contains the visual editor.
 * @param getAllButtons - If true, returns all add instance buttons. If false, returns only the previous and next buttons.
 * @returns An array of HTMLButtonElement instances or null if there are less than 2 buttons.
 */
export function getAddInstanceButtons(
    visualEditorContainer: HTMLDivElement,
    getAllButtons = false
): HTMLButtonElement[] | [HTMLButtonElement, HTMLButtonElement] | null {
    const buttons = visualEditorContainer.getElementsByClassName(
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
