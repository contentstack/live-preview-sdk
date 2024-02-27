import { render } from "preact";
import { PublicLogger } from "../../logger/logger";
import StartEditingButtonComponent from "../components/startEditingButton";

/**
 * Generates a start editing button for the visual editor.
 *
 * @param visualEditorContainer - The HTMLDivElement that wraps the visual editor.
 * @returns The generated HTMLAnchorElement representing the start editing button, or undefined if the visualEditorContainer is null.
 */
export function generateStartEditingButton(
    visualEditorContainer: HTMLDivElement | null
): HTMLAnchorElement | undefined {
    if (!visualEditorContainer) {
        PublicLogger.warn("Live Editor overlay not found.");
        return;
    }

    const wrapper = document.createDocumentFragment();
    render(<StartEditingButtonComponent />, wrapper);

    visualEditorContainer.appendChild(wrapper);

    const startEditingButton = document.querySelector(
        ".visual-editor__start-editing-btn"
    ) as HTMLAnchorElement;

    return startEditingButton;
}
