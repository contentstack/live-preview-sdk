import { render } from "preact";
import PseudoEditableFieldComponent from "../components/pseudoEditableField";

/**
 * Checks if the content of an element is truncated with ellipsis.
 *
 * @param element The HTML element to check.
 * @returns A boolean indicating whether the content is truncated with ellipsis.
 */
export function isEllipsisActive(element: HTMLElement): boolean {
    return element.offsetWidth < element.scrollWidth;
}

/**
 * Generates a pseudo editable element based on the provided parameters.
 * The pseudo editable element is created as a <div> element with the provided text content,
 * positioned absolutely at the same location as the editable element.
 * The original editable element is hidden while the pseudo editable element is displayed.
 * It is used to edit the text content if the original editable element is not completely
 * visible.
 *
 * @param elements - An object containing the editable element.
 * @param elements.editableElement - The HTML element to be replaced with the pseudo editable element.
 * @param config - An object containing the configuration for the pseudo editable element.
 * @param config.textContent - The text content to be displayed in the pseudo editable element.
 *
 * @returns The generated pseudo editable element as an HTMLDivElement.
 */
export function generatePseudoEditableElement(
    elements: {
        editableElement: HTMLElement;
    },
    config: { textContent: string }
): HTMLDivElement {
    const { editableElement } = elements;

    const visualEditorContainer = document.querySelector(
        ".visual-builder__container"
    );
    const wrapper = document.createDocumentFragment();
    render(
        <PseudoEditableFieldComponent
            editableElement={editableElement}
            config={config}
        />,
        wrapper
    );

    visualEditorContainer?.appendChild(wrapper);

    const pseudoEditableElement = document.querySelector(
        ".visual-builder__pseudo-editable-element"
    ) as HTMLDivElement;

    // TODO: set up a observer for UI shift.
    return pseudoEditableElement;
}
