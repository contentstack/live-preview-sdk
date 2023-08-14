import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import {
    handleAddButtonsForMultiple,
    hideAddInstanceButtons,
} from "./multipleElementAddButton";
import { FieldDataType } from "./types/index.types";

/**
 * The field that can be directly modified using contenteditable=true.
 * This includes all text fields like title and numbers.
 */
const ALLOWED_INLINE_EDITABLE_FIELD: FieldDataType[] = [
    FieldDataType.SINGLELINE,
    FieldDataType.MULTILINE,
    FieldDataType.NUMBER,
];

export function handleIndividualFields(
    eventDetails: VisualEditorCslpEventDetails,
    elements: {
        overlayWrapper: HTMLDivElement;
        visualEditorWrapper: HTMLDivElement;
        nextButton: HTMLButtonElement;
        previousButton: HTMLButtonElement;
    }
): void {
    const { fieldSchema, editableElement } = eventDetails;
    const { overlayWrapper, visualEditorWrapper, nextButton, previousButton } =
        elements;
    const fieldType = getFieldType(fieldSchema);

    editableElement.setAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
        fieldType
    );

    const existingReplaceButtons = document.getElementsByClassName(
        "visual-editor__replace-button"
    );

    // @ts-ignore
    for (const existingReplaceButton of existingReplaceButtons) {
        existingReplaceButton.remove();
    }

    const targetDOMDimension = editableElement.getBoundingClientRect();

    if (
        fieldSchema?.data_type === "block" || // originally, this condition was not herer
        fieldSchema?.multiple ||
        (fieldSchema.data_type === "reference" &&
            // @ts-ignore
            fieldSchema.field_metadata.ref_multiple)
    ) {
        handleAddButtonsForMultiple({
            editableElement: eventDetails.editableElement,
            visualEditorWrapper: visualEditorWrapper,
            nextButton: nextButton,
            previousButton: previousButton,
        });
        return;
    }

    // TODO: handle multiple type
    // * title, single single_line, single multi_line, single number
    if (
        ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType) &&
        !fieldSchema.multiple
    ) {
        editableElement.setAttribute("contenteditable", "true");
        editableElement.addEventListener("input", handleFieldInput);
        editableElement.addEventListener("keydown", handleFieldKeyDown);

        return;
    }

    if (fieldSchema.data_type === "file") {
        const replaceButton = document.createElement("button");
        replaceButton.classList.add("visual-editor__replace-button");
        replaceButton.innerHTML = `Replace Asset`;
        replaceButton.style.top = `${
            targetDOMDimension.bottom + window.scrollY - 30
        }px`;
        replaceButton.style.right = `${
            window.innerWidth - targetDOMDimension.right
        }px`;

        overlayWrapper?.appendChild(replaceButton);
        return;
    }

    //
}

export function cleanIndividualFieldResidual(elements: {
    overlayWrapper: HTMLDivElement;
    previousSelectedEditableDOM: Element;
    visualEditorWrapper: HTMLDivElement | null;
    nextButton: HTMLButtonElement;
    previousButton: HTMLButtonElement;
}): void {
    const {
        overlayWrapper,
        previousSelectedEditableDOM,
        visualEditorWrapper,
        nextButton,
        previousButton,
    } = elements;

    hideAddInstanceButtons({
        eventTarget: null,
        visualEditorWrapper: visualEditorWrapper,
        nextButton: nextButton,
        previousButton: previousButton,
        overlayWrapper: overlayWrapper,
    });

    previousSelectedEditableDOM.removeAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
    );
    previousSelectedEditableDOM.removeAttribute("contenteditable");
    previousSelectedEditableDOM.removeEventListener("input", handleFieldInput);
    previousSelectedEditableDOM.removeEventListener(
        "keydown",
        handleFieldKeyDown
    );
}
