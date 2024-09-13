import { useSignal } from "@preact/signals";
import { CslpData } from "../../cslp/types/cslp.types";
import getChildrenDirection from "../utils/getChildrenDirection";
import {
    ALLOWED_MODAL_EDITABLE_FIELD,
    ALLOWED_REPLACE_FIELDS,
    DEFAULT_MULTIPLE_FIELDS,
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
import classNames from "classnames";
import { liveEditorStyles } from "../liveEditor.style";
import CommentIcon from "./CommentIcon";
import React, { useEffect, useState } from "preact/compat";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { IReferenceContentTypeSchema } from "../../cms/types/contentTypeSchema.types";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";

export type FieldDetails = Pick<VisualEditorCslpEventDetails, "editableElement" | "fieldMetadata">;
interface MultipleFieldToolbarProps extends FieldDetails {};

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
        fieldMetadata,
        editableElement: targetElement,
    } = props;
    const direction = useSignal("");
    const parentPath =
        fieldMetadata?.multipleFieldMetadata?.parentDetails?.parentCslpValue ||
        "";
    const [fieldSchema, setFieldSchema] = useState<ISchemaFieldMap | null>(null);

    let isModalEditable = false;
    let isReplaceAllowed = false;
    let isMultiple = false;
    let Icon = null;
    let fieldType = null;

    if(fieldSchema) {
        const { isDisabled } = isFieldDisabled(
            fieldSchema,
            {
                editableElement: targetElement,
                fieldMetadata
            }
        );

        // field is disabled, no actions needed
        if (isDisabled) {
            return null;
        }

        fieldType = getFieldType(fieldSchema);
        isModalEditable = ALLOWED_MODAL_EDITABLE_FIELD.includes(fieldType);
        isReplaceAllowed = ALLOWED_REPLACE_FIELDS.includes(fieldType);

        Icon = fieldIcons[fieldType];

        isMultiple = fieldSchema.multiple || false;
        if(fieldType === FieldDataType.REFERENCE)
            isMultiple = (fieldSchema as IReferenceContentTypeSchema).field_metadata.ref_multiple;
    }
    
    direction.value = getChildrenDirection(targetElement, parentPath);

    const editButton = Icon ? (
        <button
            data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"
            className={classNames(
                "visual-builder__button visual-builder__button--secondary visual-builder__button--edit",
                liveEditorStyles()["visual-builder__button"],
                liveEditorStyles()["visual-builder__button--secondary"],
                liveEditorStyles()["visual-builder__button--edit"]
            )}
            onClick={(e) => {
                // TODO the listener for field path is attached to the common parent requiring
                // propagation to be stopped, should ideally only attach onClick to fieldpath dropdown
                e.preventDefault();
                e.stopPropagation();
                handleEdit(props.fieldMetadata);
            }}
        >
            <Icon />
        </button>
    ) : null;

    const replaceButton = fieldType ? (
        <button
            className={classNames(
                "visual-builder__replace-button visual-builder__button visual-builder__button--secondary",
                liveEditorStyles()["visual-builder__button"],
                liveEditorStyles()["visual-builder__button--secondary"]
            )}
            data-testid={`visual-editor-replace-${fieldType}`}
            onClick={(e) => {
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
    ) : null;

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

    useEffect(() => {
        async function fetchFieldSchema() {
            const fieldSchema = await FieldSchemaMap.getFieldSchema(
                fieldMetadata.content_type_uid,
                fieldMetadata.fieldPath
            );
            setFieldSchema(fieldSchema);
        }
        fetchFieldSchema();
    }, [fieldMetadata]);

    return (
        <div
            className={classNames(
                "visual-builder__focused-toolbar__multiple-field-toolbar",
                liveEditorStyles()[
                    "visual-builder__focused-toolbar__multiple-field-toolbar"
                ]
            )}
            data-testid="visual-builder__focused-toolbar__multiple-field-toolbar"
        >
            { fieldSchema ? 
                <div
                    className={classNames(
                        "visual-builder__focused-toolbar__button-group",
                        liveEditorStyles()[
                            "visual-builder__focused-toolbar__button-group"
                        ]
                    )}
                >
                    {isMultiple ? (
                        <>
                            <button
                                data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
                                className={classNames(
                                    `visual-builder__button visual-builder__button--secondary`,
                                    liveEditorStyles()["visual-builder__button"],
                                    liveEditorStyles()[
                                        "visual-builder__button--secondary"
                                    ]
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMoveInstance(
                                        fieldMetadata,
                                        "previous"
                                    );
                                }}
                                disabled={disableMoveLeft}
                            >
                                <MoveLeftIcon
                                    className={classNames({
                                        "visual-builder__rotate--90":
                                            direction.value === "vertical",
                                        [liveEditorStyles()[
                                            "visual-builder__rotate--90"
                                        ]]: direction.value === "vertical",
                                    })}
                                    disabled={disableMoveLeft}
                                />
                            </button>

                            <button
                                data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
                                className={classNames(
                                    `visual-builder__button visual-builder__button--secondary`,
                                    liveEditorStyles()["visual-builder__button"],
                                    liveEditorStyles()[
                                        "visual-builder__button--secondary"
                                    ]
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleMoveInstance(fieldMetadata, "next");
                                }}
                                disabled={disableMoveRight}
                            >
                                <MoveRightIcon
                                    className={classNames({
                                        "visual-builder__rotate--90":
                                            direction.value === "vertical",
                                        [liveEditorStyles()[
                                            "visual-builder__rotate--90"
                                        ]]: direction.value === "vertical",
                                    })}
                                    disabled={disableMoveRight}
                                />
                            </button>

                            {isModalEditable ? editButton : null}
                            {isReplaceAllowed ? replaceButton : null}

                            <button
                                data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
                                className={classNames(
                                    "visual-builder__button visual-builder__button--secondary",
                                    liveEditorStyles()["visual-builder__button"],
                                    liveEditorStyles()[
                                        "visual-builder__button--secondary"
                                    ]
                                )}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleDeleteInstance(fieldMetadata);
                                }}
                            >
                                <DeleteIcon />
                            </button>
                        </>
                    ) : (
                        <>
                            {isModalEditable ? editButton : null}
                            {isReplaceAllowed ? replaceButton : null}
                            <CommentIcon fieldMetadata={fieldMetadata} fieldSchema={fieldSchema}/>
                            
                        </>
                    )}
                </div>
            : null}
            
        </div>
    );
}

export default FieldToolbarComponent;
