import { throttle } from "lodash-es";
import { VisualBuilder } from "../index";
import {
    isEllipsisActive,
    generatePseudoEditableElement,
} from "../generators/generatePseudoEditableField";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";
import { getMultilinePlaintext } from "./getMultilinePlaintext";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import { FieldDataType, VisualBuilderEditContext } from "./types/index.types";
import { updateFocussedState } from "./updateFocussedState";
import { pasteAsPlainText } from "./pasteAsPlainText";

export function enableInlineEditing({
    expectedFieldData,
    editableElement,
    fieldType,
    elements,
}: {
    expectedFieldData: any;
    editableElement: HTMLElement;
    fieldType: FieldDataType;
    elements: VisualBuilderEditContext;
}) {
    const { visualBuilderContainer, resizeObserver } = elements;
    let actualEditableField = editableElement as HTMLElement;

    VisualBuilder.VisualBuilderGlobalState.value.focusFieldValue =
        actualEditableField?.innerText;

    const elementComputedDisplay =
        window.getComputedStyle(actualEditableField).display;

    let textContent =
        (editableElement as HTMLElement).innerText ||
        editableElement.textContent ||
        "";

    if (fieldType === FieldDataType.MULTILINE) {
        textContent = getMultilinePlaintext(actualEditableField);
        actualEditableField.addEventListener("paste", pasteAsPlainText);
    }
    const expectedTextContent = expectedFieldData;
    if (
        (expectedTextContent && textContent !== expectedTextContent) ||
        isEllipsisActive(editableElement as HTMLElement)
    ) {
        // TODO: Testing will be done in the E2E.
        const pseudoEditableField = generatePseudoEditableElement(
            { editableElement: editableElement as HTMLElement },
            { textContent: expectedFieldData }
        );

        (editableElement as HTMLElement).style.visibility = "hidden";

        // set field type attribute to the pseudo editable field
        // ensures proper keydown handling similar to the actual editable field
        pseudoEditableField.setAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
            fieldType
        );
        visualBuilderContainer.appendChild(pseudoEditableField);
        actualEditableField = pseudoEditableField;

        if (fieldType === FieldDataType.MULTILINE)
            actualEditableField.addEventListener("paste", pasteAsPlainText);

        // we will unobserve this in hideOverlay
        elements.resizeObserver.observe(pseudoEditableField);
    } else if (elementComputedDisplay === "inline") {
        // if the editable field is inline
        const onInlineElementInput = throttle(() => {
            const overlayWrapper = visualBuilderContainer.querySelector(
                ".visual-builder__overlay__wrapper"
            ) as HTMLDivElement;
            const focusedToolbar = visualBuilderContainer.querySelector(
                ".visual-builder__focused-toolbar"
            ) as HTMLDivElement;
            updateFocussedState({
                editableElement: actualEditableField,
                visualBuilderContainer,
                overlayWrapper,
                focusedToolbar,
                resizeObserver,
            });
        }, 200);
        actualEditableField.addEventListener("input", onInlineElementInput);
    }

    actualEditableField.setAttribute("contenteditable", "true");
    actualEditableField.addEventListener("input", handleFieldInput);
    actualEditableField.addEventListener("keydown", handleFieldKeyDown);
    // focus on the contenteditable element to start accepting input
    actualEditableField.focus();

    return;
}
