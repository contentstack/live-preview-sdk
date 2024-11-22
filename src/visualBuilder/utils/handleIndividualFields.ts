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
import {
    handleAddButtonsForMultiple,
    removeAddInstanceButtons,
} from "./multipleElementAddButton";
import { updateFocussedState } from "./updateFocussedState";
import { FieldDataType, ISchemaFieldMap } from "./types/index.types";
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

    !disabled && handleInlineEditing();

    /**
     * Handles inline editing for supported fields.
     */
    function handleInlineEditing() {

        if (!ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType)) return;

        // Instances of ALLOWED_INLINE_EDITABLE_FIELD will always have index at last
        const index = Number(fieldMetadata.instance.fieldPathWithIndex.split('.').at(-1));
        const isInstance = Number.isFinite(index);

        // CASE 1: Handle inline editing for multiple field
        if(isFieldMultiple(fieldSchema)) {
            let expectedFieldInstanceData = null;
            if(Array.isArray(expectedFieldData)) {
                // CASE: Selected element is the multiple field itself.
                // Inline Editing not allowed on field, only allowed on instance.
                // (We recieve unreliable `multipleFieldMetadata` in this case)
                if(!isInstance) {
                    return;
                }

                // CASE: Value does not exist for the provided instance's index
                if(index >= expectedFieldData.length) {
                    // TODO: What should be the behavior here?
                }
                else {
                    expectedFieldInstanceData = expectedFieldData.at(index);
                }
            }
            // CASE: ContentType's Field changed from single to multiple, while Entry's Field still single.
            else {
                expectedFieldInstanceData = expectedFieldData;
            }

            enableInlineEditing(expectedFieldInstanceData);     
        }
        // CASE 2: Handle inline editing for a single field
        else {
            let expectedFieldInstanceData = null;
            // CASE: ContentType's Field changed from multiple to single, while Entry's Field still multiple.
            if(isInstance) {
                if(index !== 0) {
                    // TODO: Handle this with UX
                    // Let user know, CSLP is invalid due to change in Content Type
                    return;
                }
                expectedFieldInstanceData = Array.isArray(expectedFieldData) ? expectedFieldData.at(0) : expectedFieldData;
            }
            enableInlineEditing(expectedFieldInstanceData ?? expectedFieldData);
        }

        function enableInlineEditing(expectedFieldData: any) {

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
                        focusedToolbar,
                        resizeObserver,
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

function isFieldMultiple(fieldSchema: ISchemaFieldMap): boolean {
    return fieldSchema &&
    (fieldSchema.multiple ||
        (fieldSchema.data_type === "reference" &&
            // @ts-ignore
            fieldSchema.field_metadata.ref_multiple));
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
