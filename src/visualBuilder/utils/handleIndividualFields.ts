import { VisualBuilder } from "..";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { getFieldData } from "./getFieldData";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import { isFieldDisabled } from "./isFieldDisabled";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";
import { isFieldMultiple } from "./isFieldMultiple";
import { handleInlineEditableField } from "./handleInlineEditableField";
import { VisualBuilderEditContext } from "./types/index.types";
import { pasteAsPlainText } from "./pasteAsPlainText";

/**
 * It handles all the fields based on their data type and its "multiple" property.
 * @param eventDetails The event details object that contain cslp and field metadata.
 * @param elements The elements object that contain the visual builder wrapper.
 */
export async function handleIndividualFields(
    eventDetails: VisualBuilderCslpEventDetails,
    elements: VisualBuilderEditContext
): Promise<void> {
    const { fieldMetadata, editableElement } = eventDetails;
    const { visualBuilderContainer, lastEditedField, resizeObserver } =
        elements;
    const {
        content_type_uid,
        entry_uid,
        locale,
        fieldPath,
        fieldPathWithIndex,
    } = fieldMetadata;

    const [fieldSchema, expectedFieldData] = await Promise.all([
        FieldSchemaMap.getFieldSchema(content_type_uid, fieldPath),
        getFieldData(
            { content_type_uid, entry_uid, locale },
            fieldPathWithIndex
        ),
    ]);

    const fieldType = getFieldType(fieldSchema);

    const { isDisabled: disabled } = isFieldDisabled(fieldSchema, eventDetails);

    editableElement.setAttribute(
        VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
        fieldType
    );

    if (isFieldMultiple(fieldSchema)) {
        if (lastEditedField !== editableElement) {
            const addButtonLabel =
                fieldSchema.data_type === "blocks"
                    ? // ? `Add ${fieldSchema.display_name ?? "Modular Block"}`
                      "Add Section"
                    : undefined;

            handleAddButtonsForMultiple(
                eventDetails,
                {
                    editableElement: eventDetails.editableElement,
                    visualBuilderContainer: visualBuilderContainer,
                    resizeObserver: resizeObserver,
                },
                {
                    fieldSchema,
                    expectedFieldData,
                    disabled,
                    label: addButtonLabel,
                }
            );
        }
    }

    if (disabled) {
        return;
    }
    handleInlineEditableField({
        fieldType,
        fieldSchema,
        fieldMetadata,
        expectedFieldData,
        editableElement: editableElement as HTMLElement,
        elements,
    });
}

export function cleanIndividualFieldResidual(elements: {
    overlayWrapper: HTMLDivElement;
    visualBuilderContainer: HTMLDivElement | null;
    focusedToolbar: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}): void {
    const { overlayWrapper, visualBuilderContainer, focusedToolbar } = elements;

    removeAddInstanceButtons(
        {
            eventTarget: null,
            visualBuilderContainer: visualBuilderContainer,
            overlayWrapper: overlayWrapper,
        },
        true
    );

    const previousSelectedEditableDOM =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    if (previousSelectedEditableDOM) {
        previousSelectedEditableDOM.removeAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
        );
        previousSelectedEditableDOM.removeAttribute("contenteditable");
        previousSelectedEditableDOM.removeEventListener(
            "input",
            handleFieldInput
        );
        previousSelectedEditableDOM.removeEventListener(
            "keydown",
            handleFieldKeyDown
        );

        previousSelectedEditableDOM.removeEventListener(
            "paste",
            pasteAsPlainText
        );
        // Note - this happens in two places, 1. hideOverlay and 2. here
        // TODO maybe see all usages of both functions and try to do it in one place
        elements.resizeObserver.unobserve(previousSelectedEditableDOM);
    }

    const pseudoEditableElement = visualBuilderContainer?.querySelector(
        ".visual-builder__pseudo-editable-element"
    );
    if (pseudoEditableElement) {
        elements.resizeObserver.unobserve(pseudoEditableElement);
        pseudoEditableElement.removeEventListener("paste", pasteAsPlainText);
        pseudoEditableElement.remove();
        if (previousSelectedEditableDOM) {
            (previousSelectedEditableDOM as HTMLElement).style.removeProperty(
                "visibility"
            );
        }
    }

    if (focusedToolbar) {
        focusedToolbar.innerHTML = "";
        const toolbarEvents = [
            VisualBuilderPostMessageEvents.DELETE_INSTANCE,
            VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID,
        ];
        toolbarEvents.forEach((event) => {
            //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
            if (visualBuilderPostMessage?.requestMessageHandlers?.has(event)) {
                //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
                visualBuilderPostMessage?.unregisterEvent?.(event);
            }
        });
    }
}
