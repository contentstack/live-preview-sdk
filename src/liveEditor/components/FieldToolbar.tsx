import { useSignal } from "@preact/signals";
import { CslpData } from "../../cslp/types/cslp.types";
import getChildrenDirection from "../utils/getChildrenDirection";

import {
    ALLOWED_MODAL_EDITABLE_FIELD,
    ALLOWED_REPLACE_FIELDS,
} from "../utils/constants";
import { getFieldType } from "../utils/getFieldType";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../utils/instanceHandlers";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { FieldDataType, ISchemaFieldMap } from "../utils/types/index.types";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import {
    DeleteIcon,
    MoveLeftIcon,
    MoveRightIcon,
    ReplaceAssetIcon,
} from "./icons";
import { fieldIcons } from "./icons/fields";

interface MultipleFieldToolbarProps {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
    targetElement: Element;
    isMultiple: boolean;
    isDisabled: boolean;
}

function handleReplaceAsset(fieldMetadata: CslpData) {
    // TODO avoid sending whole fieldMetadata
    liveEditorPostMessage?.send(LiveEditorPostMessageEvents.OPEN_ASSET_MODAL, {
        fieldMetadata,
    });
}

function handleReplaceReference(fieldMetadata: CslpData) {
    const isMultipleInstance =
        fieldMetadata.multipleFieldMetadata.index > -1 &&
        fieldMetadata.fieldPathWithIndex ===
            fieldMetadata.multipleFieldMetadata.parentDetails?.parentPath;
    const entryPath = isMultipleInstance
        ? fieldMetadata.instance.fieldPathWithIndex
        : fieldMetadata.fieldPathWithIndex;

    liveEditorPostMessage?.send(
        LiveEditorPostMessageEvents.OPEN_REFERENCE_MODAL,
        {
            entry_uid: fieldMetadata.entry_uid,
            content_type_uid: fieldMetadata.content_type_uid,
            locale: fieldMetadata.locale,
            fieldPath: fieldMetadata.fieldPath,
            fieldPathWithIndex: fieldMetadata.fieldPathWithIndex,
            entryPath,
        }
    );
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
    const isReplaceAllowed = ALLOWED_REPLACE_FIELDS.includes(fieldType);
    const Icon = fieldIcons[fieldType];

    const editButton = Icon ? (
        <button
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__edit-button"
            className="visual-editor__button visual-editor__button--secondary visual-editor__button--edit"
            onClick={(e: React.MouseEvent) => {
                // TODO the listener for field path is attached to the common parent requiring
                // propagation to be stopped, should ideally only attach onClick to fieldpath dropdown
                e.preventDefault();
                e.stopPropagation();
                handleEdit(props.fieldMetadata);
            }}
        >
            {Icon && <Icon />}
        </button>
    ) : null;

    const replaceButton = (
        <button
            className="visual-editor__replace-button visual-editor__button visual-editor__button--secondary"
            data-testid={`visual-editor-replace-${fieldType}`}
            onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                e.preventDefault();
                if (fieldType === FieldDataType.REFERENCE) {
                    handleReplaceReference(props.fieldMetadata);
                    return;
                } else if (fieldType === FieldDataType.FILE) {
                    handleReplaceAsset(props.fieldMetadata);
                    return;
                }
            }}
        >
            <ReplaceAssetIcon />
        </button>
    );

    // field is disabled, no actions needed
    if (isDisabled) {
        return null;
    }

    // field is multiple but an instance is not selected
    // instead the whole field (all instances) is selected.
    // Currently, when whole featured_blogs is selected in canvas,
    // the fieldPathWithIndex and instance.fieldPathWithIndex are the same
    // cannot rely on -1 index, as the non-negative index then refers to the index of
    // the featured_blogs block in page_components
    if (
        (isMultiple &&
            fieldMetadata.fieldPathWithIndex ===
                fieldMetadata.instance.fieldPathWithIndex) ||
        (isMultiple && fieldMetadata.multipleFieldMetadata?.index === -1)
    ) {
        return null;
    }

    const totalElementCount = targetElement?.parentNode?.childElementCount ?? 1;
    const indexOfElement = fieldMetadata?.multipleFieldMetadata?.index;

    const disableMoveLeft = indexOfElement === 0; // first element
    const disableMoveRight = indexOfElement === totalElementCount - 1; // last element

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
                            disabled={disableMoveLeft}
                        >
                            <MoveLeftIcon disabled={disableMoveLeft} />
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
                            disabled={disableMoveRight}
                        >
                            <MoveRightIcon disabled={disableMoveRight} />
                        </button>

                        {isModalEditable ? editButton : null}
                        {isReplaceAllowed ? replaceButton : null}

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
                    <>
                        {isModalEditable ? editButton : null}
                        {isReplaceAllowed ? replaceButton : null}
                    </>
                )}
            </div>
        </div>
    );
}

export default FieldToolbarComponent;
