import { render } from "preact";
import { PublicLogger } from "../../logger/logger";
import StartEditingButtonComponent from "../components/startEditingButton";

/**
 * Generates a start editing button for the visual builder.
 *
 * @param visualBuilderContainer - The HTMLDivElement that wraps the visual builder.
 * @returns The generated HTMLAnchorElement representing the start editing button, or undefined if the visualBuilderContainer is null.
 */
export function generateStartEditingButton(
    visualBuilderContainer: HTMLDivElement | null
): HTMLAnchorElement | undefined {
    if (!visualBuilderContainer) {
        PublicLogger.warn("Visual builder overlay not found.");
        return;
    }

    const wrapper = document.createDocumentFragment();
    render(<StartEditingButtonComponent />, wrapper);

    visualBuilderContainer?.appendChild(wrapper);

    const startEditingButton = document.querySelector(
        ".visual-builder__start-editing-btn"
    ) as HTMLAnchorElement;

    return startEditingButton;
}
