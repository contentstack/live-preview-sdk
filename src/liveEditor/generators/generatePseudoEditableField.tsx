import { toString } from "lodash-es";
import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { render } from "preact";
import PseudoEditableFieldComponent from "../components/pseudoEditableField";

/**
 * Retrieves the expected field data based on the provided field metadata.
 *
 * @param fieldMetadata The metadata of the field.
 * @returns A promise that resolves to the expected field data as a string.
 */
export async function getExpectedFieldData(
    fieldMetadata: CslpData
): Promise<string> {
    const data = await liveEditorPostMessage?.send<{ fieldData: unknown }>(
        LiveEditorPostMessageEvents.GET_FIELD_DATA,
        { fieldMetadata }
    );

    return toString(data?.fieldData);
}


/**
 * Retrieves the computed style of an HTML element.
 *
 * @param element - The HTML element to retrieve the style from.
 * @returns An object representing the computed style of the element.
 */
export function getStyleOfAnElement(element: HTMLElement): { [key: string]: string } {
    const styleSheetDeclaration = window.getComputedStyle(element);
    const styleSheetArray = Array.from(styleSheetDeclaration);

    const FILTER_STYLES = [
        "position",
        "left",
        "top",
        "right",
        "bottom",
        "text-overflow",
        "margin",
        "margin-block-end",
        "margin-block-start",
        "margin-inline-end",
        "margin-inline-start",
        "margin-left",
        "margin-right",
        "margin-top",
        "margin-bottom",
        "-webkit-user-modify",
    ];

    const styles: { [key: string]: string } = {};
    styleSheetArray.forEach((style: string) => {
        if (!FILTER_STYLES.includes(style)) {
            const styleValue = styleSheetDeclaration.getPropertyValue(style);
            styles[style] = styleValue;
        }
    });

    return styles;
}


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

    const visualEditorContainer = document.querySelector(".visual-editor__container");
    const wrapper = document.createDocumentFragment();
    render(<PseudoEditableFieldComponent 
        editableElement={editableElement}
        config={config}
        />, wrapper);

    visualEditorContainer?.appendChild(wrapper)
    
    const pseudoEditableElement = document.querySelector(".visual-editor__pseudo-editable-element") as HTMLDivElement;

    console.log('[IN SDK] : generatePseudoEditableElement', pseudoEditableElement);

    // TODO: set up a observer for UI shift.
    return pseudoEditableElement;
}
