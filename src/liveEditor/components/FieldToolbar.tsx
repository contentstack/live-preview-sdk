import { useSignal } from "@preact/signals";
import { CslpData } from "../../cslp/types/cslp.types";
import getChildrenDirection from "../utils/getChildrenDirection";

import { ALLOWED_MODAL_EDITABLE_FIELD } from "../utils/constants";
import { getFieldType } from "../utils/getFieldType";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../utils/instanceHandlers";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { DeleteIcon, EditIcon, MoveLeftIcon, MoveRightIcon } from "./icons";
import { fieldIcons } from "./icons/fields";

interface MultipleFieldToolbarProps {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
    targetElement: Element;
    isMultiple: boolean;
    isDisabled: boolean;
}

function handleEdit(fieldMetadata: CslpData) {
    liveEditorPostMessage?.send(
        LiveEditorPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
        { fieldMetadata }
    );
}

function FieldToolbarComponent(
    props: MultipleFieldToolbarProps
): JSX.Element | null {
    const {
        isDisabled,
        isMultiple,
        fieldMetadata,
        fieldSchema,
        targetElement,
    } = props;
    const direction = useSignal("");
    const parentPath =
        fieldMetadata?.multipleFieldMetadata?.parentDetails?.parentCslpValue ||
        "";

    direction.value = getChildrenDirection(targetElement, parentPath);

    const fieldType = getFieldType(fieldSchema);
    const isModalEditable = ALLOWED_MODAL_EDITABLE_FIELD.includes(fieldType);
    const Icon = fieldIcons[fieldType];

    const editButton = Icon ? (
        <button
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__edit-button"
            className="visual-editor__button visual-editor__button--secondary"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(props.fieldMetadata);
            }}
        >
            {Icon && <Icon />}
        </button>
    ) : null;

    // field is disabled, no actions needed
    if (isDisabled) {
        return null;
    }

    // field is multiple but an instance is not selected
    // instead the whole field (all instances) is selected
    if (
        fieldSchema.multiple &&
        fieldMetadata.multipleFieldMetadata?.index === -1
    ) {
        return null;
    }

    return (
        <div
            className="visual-editor__focused-toolbar__multiple-field-toolbar"
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar"
        >
            <div className="visual-editor__focused-toolbar__button-group">
                {isMultiple ? (
                    <>
                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__move-left-button"
                            className={`visual-editor__button visual-editor__button--secondary ${
                                direction.value === "vertical"
                                    ? "visual-editor__rotate--90"
                                    : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveInstance(
                                    props.fieldMetadata,
                                    "previous"
                                );
                            }}
                        >
                            <MoveLeftIcon />
                        </button>

                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__move-right-button"
                            className={`visual-editor__button visual-editor__button--secondary ${
                                direction.value === "vertical"
                                    ? "visual-editor__rotate--90"
                                    : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveInstance(props.fieldMetadata, "next");
                            }}
                        >
                            <MoveRightIcon />
                        </button>

                        {isModalEditable ? editButton : null}

                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__delete-button"
                            className="visual-editor__button visual-editor__button--secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteInstance(props.fieldMetadata);
                            }}
                        >
                            <DeleteIcon />
                        </button>
                    </>
                ) : (
                    <>{isModalEditable ? editButton : null}</>
                )}
            </div>
        </div>
    );
}

export default FieldToolbarComponent;
