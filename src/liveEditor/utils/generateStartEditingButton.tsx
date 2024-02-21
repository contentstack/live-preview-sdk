import { render } from "preact";
import { PublicLogger } from "../../logger/logger";
import StartEditingButtonComponent from "../components/startEditingButton";


/**
 * Generates a start editing button for the visual editor.
 *
 * @param visualEditorWrapper - The HTMLDivElement that wraps the visual editor.
 * @returns The generated HTMLAnchorElement representing the start editing button, or undefined if the visualEditorWrapper is null.
 */
export function generateStartEditingButton(
    visualEditorWrapper: HTMLDivElement | null
): HTMLAnchorElement | undefined {
    if (!visualEditorWrapper) {
        PublicLogger.warn("Live Editor overlay not found.");
        return;
    }

    console.log('[IN SDK] : generateStartEditingButton');
    
    const wrapper = document.createDocumentFragment();
    render(<StartEditingButtonComponent />, wrapper);

    visualEditorWrapper.appendChild(wrapper);

    const startEditingButton = document.querySelector(".visual-editor__start-editing-btn") as HTMLAnchorElement;

    return startEditingButton;
}
