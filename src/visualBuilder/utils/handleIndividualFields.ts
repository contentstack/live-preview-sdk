import { debounce, throttle } from "lodash-es";
import { VisualBuilder } from "..";
import {
    generatePseudoEditableElement,
    isEllipsisActive,
} from "../generators/generatePseudoEditableField";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import {
    ALLOWED_INLINE_EDITABLE_FIELD,
    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
} from "./constants";
import { FieldSchemaMap } from "./fieldSchemaMap";
import { getFieldData } from "./getFieldData";
import { getFieldType } from "./getFieldType";
import { handleFieldInput, handleFieldKeyDown } from "./handleFieldMouseDown";
import { isFieldDisabled } from "./isFieldDisabled";
import visualBuilderPostMessage from "./visualBuilderPostMessage";
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import { updateFocussedState } from "./updateFocussedState";
import { FieldDataType } from "./types/index.types";
import { getMultilinePlaintext } from "./getMultilinePlaintext";

/**
 * It handles all the fields based on their data type and its "multiple" property.
 * @param eventDetails The event details object that contain cslp and field metadata.
 * @param elements The elements object that contain the visual builder wrapper.
 */
export async function handleIndividualFields(
    eventDetails: VisualBuilderCslpEventDetails,
    elements: {
        visualBuilderContainer: HTMLDivElement;
        resizeObserver: ResizeObserver;
        lastEditedField: Element | null;
    }
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
    // if value is an array, get the value for the instance
    const expectedFieldInstanceData = Array.isArray(expectedFieldData)
        ? expectedFieldData.at(fieldMetadata.multipleFieldMetadata.index)
        : undefined;

    const fieldType = getFieldType(fieldSchema);

    const { isDisabled: disabled } = isFieldDisabled(fieldSchema, eventDetails);

    editableElement.setAttribute(
        VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
        fieldType
    );

    if (
        fieldSchema &&
        (fieldSchema?.multiple ||
            (fieldSchema?.data_type === "reference" &&
                // @ts-ignore
                fieldSchema?.field_metadata.ref_multiple))
    ) {
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

        // * fields could be handled as they are in a single instance
        if (eventDetails.fieldMetadata.multipleFieldMetadata.index > -1) {
            handleSingleField(
                {
                    editableElement,
                    visualBuilderContainer,
                    resizeObserver: elements.resizeObserver,
                },
                { expectedFieldData: expectedFieldInstanceData, disabled }
            );
        }
    } else {
        handleSingleField(
            {
                editableElement,
                visualBuilderContainer,
                resizeObserver: elements.resizeObserver,
            },
            { expectedFieldData, disabled }
        );
    }

    /**
     * Handles all the fields based on their data type.
     */
    function handleSingleField(
        elements: {
            editableElement: Element;
            visualBuilderContainer: HTMLDivElement;
            resizeObserver: ResizeObserver;
        },
        config: { expectedFieldData: string; disabled?: boolean }
    ) {
        const { editableElement, visualBuilderContainer } = elements;

        if (config.disabled) {
            return;
        }

        // * title, single single_line, single multi_line, single number
        if (ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType)) {
            let actualEditableField = editableElement as HTMLElement;
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
            const expectedTextContent = config.expectedFieldData;
            if (
                textContent !== expectedTextContent ||
                isEllipsisActive(editableElement as HTMLElement)
            ) {
                // TODO: Testing will be don in the E2E.
                const pseudoEditableField = generatePseudoEditableElement(
                    { editableElement: editableElement as HTMLElement },
                    { textContent: config.expectedFieldData }
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
                    actualEditableField.addEventListener(
                        "paste",
                        pasteAsPlainText
                    );

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
                        resizeObserver,
                        focusedToolbar,
                    });
                }, 200);
                actualEditableField.addEventListener(
                    "input",
                    onInlineElementInput
                );
            }

            actualEditableField.setAttribute("contenteditable", "true");
            actualEditableField.addEventListener("input", handleFieldInput);
            actualEditableField.addEventListener("keydown", handleFieldKeyDown);
            // focus on the contenteditable element to start accepting input
            actualEditableField.focus();

            return;
        }
    }
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
    }
}

const pasteAsPlainText = debounce(
    (e: Event) => {
        e.preventDefault();
        const clipboardData = (e as ClipboardEvent).clipboardData;
        document.execCommand(
            "inserttext",
            false,
            clipboardData?.getData("text/plain")
        );
    },
    100,
    { leading: true }
);
