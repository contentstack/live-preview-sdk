import { render } from "preact";
import { PublicLogger } from "../../logger/logger";
import StartEditingButtonComponent from "../components/startEditingButton";

/**
 * Generates a start editing button for the visual builder.
 *
 * @returns The generated HTMLAnchorElement representing the start editing button, or undefined if the button cannot be created.
 */
export function generateStartEditingButton(): HTMLAnchorElement | undefined {
    const existingButton = document.querySelector(
        ".visual-builder__start-editing-btn"
    ) as HTMLAnchorElement;

    if (existingButton) {
        return existingButton;
    }

    const wrapper = document.createDocumentFragment();
    render(<StartEditingButtonComponent />, wrapper);

    if (wrapper.children.length === 0) {
        return undefined;
    }

    document.body.appendChild(wrapper);

    const startEditingButton = document.querySelector(
        ".visual-builder__start-editing-btn"
    ) as HTMLAnchorElement;

    return startEditingButton;
}
