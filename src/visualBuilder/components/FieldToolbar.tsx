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
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { FieldDataType, ISchemaFieldMap } from "../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import {
    CaretIcon,
    DeleteIcon,
    MoveLeftIcon,
    MoveRightIcon,
    ReplaceAssetIcon,
    MoreIcon,
} from "./icons";
import { fieldIcons } from "./icons/fields";
import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import CommentIcon from "./CommentIcon";
import React, { useEffect, useState, useRef } from "preact/compat";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { IReferenceContentTypeSchema } from "../../cms/types/contentTypeSchema.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { FormIcon } from "./icons";
import { getDOMEditStack } from "../utils/getCsDataOfElement";
import { VariantIcon } from "./icons/variant";
import {
    BASE_VARIANT_STATUS,
    getFieldVariantStatus,
    IVariantStatus,
    VariantRevertDropdown,
} from "./FieldRevert/FieldRevertComponent";
import { LoadingIcon } from "./icons/loading";
import { EntryPermissions } from "../utils/getEntryPermissions";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";
import { FieldLocationAppList } from "./FieldLocationAppList.tsx";


export type FieldDetails = Pick<
    VisualBuilderCslpEventDetails,
    "editableElement" | "fieldMetadata"
>;

const TOOLTIP_TOP_EDGE_BUFFER = 96;

interface MultipleFieldToolbarProps {
    eventDetails: VisualBuilderCslpEventDetails;
    hideOverlay: () => void;
    isVariant?: boolean;
    entryPermissions?: EntryPermissions;
}

function handleReplaceAsset(fieldMetadata: CslpData) {
    visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.OPEN_ASSET_MODAL,
        {
            fieldMetadata,
        }
    );
}

function handleReplaceReference(fieldMetadata: CslpData) {
    const isMultipleInstance =
        fieldMetadata.multipleFieldMetadata.index > -1 &&
        fieldMetadata.fieldPathWithIndex ===
            fieldMetadata.multipleFieldMetadata.parentDetails?.parentPath;
    const entryPath = isMultipleInstance
        ? fieldMetadata.instance.fieldPathWithIndex
        : fieldMetadata.fieldPathWithIndex;

    visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.OPEN_REFERENCE_MODAL,
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
    visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
        { fieldMetadata }
    );
}

function handleFormFieldFocus(eventDetails: VisualBuilderCslpEventDetails) {
    const { editableElement } = eventDetails;
    return visualBuilderPostMessage?.send(
        VisualBuilderPostMessageEvents.FOCUS_FIELD,
        {
            DOMEditStack: getDOMEditStack(editableElement),
            toggleVisibility: true,
        }
    );
}

function FieldToolbarComponent(
    props: MultipleFieldToolbarProps
): JSX.Element | null {
    const {
        eventDetails,
        isVariant: isVariantOrParentOfVariant,
        entryPermissions,
    } = props;
    const { fieldMetadata, editableElement: targetElement } = eventDetails;
    const [isFormLoading, setIsFormLoading] = useState(false);
    const [fieldLocationData, setFieldLocationData] = useState<any>(null);
    const [displayAllApps, setDisplayAllApps] = useState(false);
    const moreButtonRef = useRef<HTMLButtonElement>(null);

    const parentPath =
        fieldMetadata?.multipleFieldMetadata?.parentDetails?.parentCslpValue ||
        "";
    const isVariant = !!fieldMetadata?.variant || isVariantOrParentOfVariant;
    const direction = getChildrenDirection(targetElement, parentPath);
    const [fieldSchema, setFieldSchema] = useState<ISchemaFieldMap | null>(
        null
    );
    const [fieldVariantStatus, setFieldVariantStatus] =
        useState<IVariantStatus>(BASE_VARIANT_STATUS);
    const [isOpenVariantRevert, setIsOpenVariantRevert] =
        useState<boolean>(false);

    let isModalEditable = false;
    let isReplaceAllowed = false;
    let isMultiple = false;
    let Icon = null;
    let fieldType = null;
    let isWholeMultipleField = false;

    let disableFieldActions = false;
    if (fieldSchema) {
        const { isDisabled } = isFieldDisabled(
            fieldSchema,
            {
                editableElement: targetElement,
                fieldMetadata,
            },
            entryPermissions
        );
        disableFieldActions = isDisabled;

        fieldType = getFieldType(fieldSchema);
        isModalEditable = ALLOWED_MODAL_EDITABLE_FIELD.includes(fieldType);

        Icon = fieldIcons[fieldType];

        isMultiple = fieldSchema.multiple || false;
        if (fieldType === FieldDataType.REFERENCE)
            isMultiple = (fieldSchema as IReferenceContentTypeSchema)
                .field_metadata.ref_multiple;

        isWholeMultipleField =
            isMultiple &&
            (fieldMetadata.fieldPathWithIndex ===
                fieldMetadata.instance.fieldPathWithIndex ||
                fieldMetadata.multipleFieldMetadata?.index === -1);

        isReplaceAllowed =
            ALLOWED_REPLACE_FIELDS.includes(fieldType) && !isWholeMultipleField;
    }

    const invertTooltipPosition =
        targetElement.getBoundingClientRect().top <= TOOLTIP_TOP_EDGE_BUFFER;

    const handleMoreIconClick = () => {
        setDisplayAllApps(!displayAllApps);
    };

    const editButton = Icon ? (
        <button
            data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__edit-button"
            className={classNames(
                "visual-builder__button visual-builder__button--secondary visual-builder__button--edit",
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"],
                visualBuilderStyles()["visual-builder__button--edit"],
                visualBuilderStyles()["visual-builder__tooltip"],
                {
                    "visual-builder__tooltip--bottom": invertTooltipPosition,
                    [visualBuilderStyles()["visual-builder__tooltip--bottom"]]:
                        invertTooltipPosition,
                }
            )}
            data-tooltip={"Edit"}
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(fieldMetadata);
            }}
            disabled={disableFieldActions}
        >
            <Icon />
        </button>
    ) : null;

    const replaceButton = fieldType ? (
        <button
            className={classNames(
                "visual-builder__replace-button visual-builder__button visual-builder__button--secondary",
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"],
                visualBuilderStyles()["visual-builder__tooltip"],
                {
                    "visual-builder__tooltip--bottom": invertTooltipPosition,
                    [visualBuilderStyles()["visual-builder__tooltip--bottom"]]:
                        invertTooltipPosition,
                }
            )}
            data-tooltip={"Replace"}
            data-testid={`visual-builder-replace-${fieldType}`}
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                if (fieldType === FieldDataType.REFERENCE) {
                    handleReplaceReference(fieldMetadata);
                    return;
                } else if (fieldType === FieldDataType.FILE) {
                    handleReplaceAsset(fieldMetadata);
                    return;
                }
            }}
            disabled={disableFieldActions}
        >
            <ReplaceAssetIcon />
        </button>
    ) : null;

    const formButton = (
        <button
            className={classNames(
                "visual-builder__replace-button visual-builder__button visual-builder__button--secondary",
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"],
                visualBuilderStyles()["visual-builder__tooltip"],
                {
                    "visual-builder__tooltip--bottom": invertTooltipPosition,
                    [visualBuilderStyles()["visual-builder__tooltip--bottom"]]:
                        invertTooltipPosition,
                },
                {
                    [visualBuilderStyles()[
                        "visual-builder__button--comment-loader"
                    ]]: isFormLoading,
                    "visual-builder__button--comment-loader": isFormLoading,
                }
            )}
            data-tooltip={"Form"}
            data-testid={`visual-builder-form`}
            onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFormLoading(true);
                try {
                    await handleFormFieldFocus(eventDetails);
                } finally {
                    setIsFormLoading(false);
                }
            }}
            disabled={isFormLoading}
        >
            {isFormLoading ? <LoadingIcon /> : <FormIcon />}
        </button>
    );

    const toggleVariantDropdown = () => {
        setIsOpenVariantRevert(!isOpenVariantRevert);
    };

    const closeVariantDropdown = () => {
        setIsOpenVariantRevert(false);
    };

    const variantButton = (
        <button
            className={classNames(
                "visual-builder__variant-button visual-builder__button visual-builder__button--secondary",
                visualBuilderStyles()["visual-builder__button"],
                visualBuilderStyles()["visual-builder__button--secondary"],
                visualBuilderStyles()["visual-builder__tooltip"],
                visualBuilderStyles()["visual-builder__variant-button"],
                {
                    "visual-builder__tooltip--bottom": invertTooltipPosition,
                    [visualBuilderStyles()["visual-builder__tooltip--bottom"]]:
                        invertTooltipPosition,
                }
            )}
            data-tooltip={"Variant Revert"}
            data-testid={`visual-builder-canvas-variant-revert`}
            onClick={toggleVariantDropdown}
        >
            <VariantIcon />
            <CaretIcon open={isOpenVariantRevert} />
        </button>
    );






    const totalElementCount = targetElement?.parentNode?.childElementCount ?? 1;
    const indexOfElement = fieldMetadata?.multipleFieldMetadata?.index;

    const disableMoveLeft = indexOfElement === 0;
    const disableMoveRight = indexOfElement === totalElementCount - 1;

    useEffect(() => {
        async function fetchFieldSchema() {
            const fieldSchema = await FieldSchemaMap.getFieldSchema(
                fieldMetadata.content_type_uid,
                fieldMetadata.fieldPath
            );
            if (fieldSchema) {
                setFieldSchema(fieldSchema);
            }
            const variantStatus = await getFieldVariantStatus(fieldMetadata);
            setFieldVariantStatus(variantStatus ?? BASE_VARIANT_STATUS);
        }
        fetchFieldSchema();
    }, [fieldMetadata]);

    useEffect(() => {
        const event = visualBuilderPostMessage?.on(
            VisualBuilderPostMessageEvents.DELETE_INSTANCE,
            (args: { data: { path: string } }) => {
                if (
                    args.data?.path ===
                    fieldMetadata.instance.fieldPathWithIndex
                ) {
                    props.hideOverlay();
                }
            }
        );
        return () => {
            event?.unregister();
        };
    }, []);

    useEffect(() => {
        const event = visualBuilderPostMessage?.on(
            VisualBuilderPostMessageEvents.FIELD_LOCATION_DATA, 
            (data: { data: any }) => {
                console.log('fieldLocationData received:', data.data);
                setFieldLocationData(data.data.fieldLocationData || data.data);
            }
        );
        return () => {
            event?.unregister();
        };
    }, [fieldMetadata]);

    // Debug logging
    useEffect(() => {
        console.log('fieldLocationData state:', fieldLocationData);
        console.log('apps from fieldLocationData:', fieldLocationData?.apps);
    }, [fieldLocationData, fieldMetadata]);

    const multipleFieldToolbarButtonClasses = classNames(
        "visual-builder__button visual-builder__button--secondary",
        visualBuilderStyles()["visual-builder__button"],
        visualBuilderStyles()["visual-builder__button--secondary"],
        visualBuilderStyles()["visual-builder__tooltip"],
        {
            "visual-builder__tooltip--bottom": invertTooltipPosition,
            [visualBuilderStyles()["visual-builder__tooltip--bottom"]]:
                invertTooltipPosition,
        }
    );

    
  

    return (
        <div
            className={classNames(
                "visual-builder__field-toolbar-container",
                visualBuilderStyles()["visual-builder__field-toolbar-container"]
            )}
        >
            <div
                className={classNames(
                    "visual-builder__focused-toolbar__multiple-field-toolbar",
                    visualBuilderStyles()[
                        "visual-builder__focused-toolbar__multiple-field-toolbar"
                    ]
                )}
                data-testid="visual-builder__focused-toolbar__multiple-field-toolbar"
            >
                <div
                    className={classNames(
                        "visual-builder__focused-toolbar__button-group",
                        visualBuilderStyles()[
                            "visual-builder__focused-toolbar__button-group"
                        ]
                    )}
                >
                    <>
                        {isVariant ? (
                            <VariantRevertDropdown
                                fieldDataName={fieldMetadata.fieldPathWithIndex}
                                fieldMetadata={fieldMetadata}
                                variantStatus={fieldVariantStatus}
                                isOpen={isOpenVariantRevert}
                                closeDropdown={closeVariantDropdown}
                                invertTooltipPosition={invertTooltipPosition}
                                toggleVariantDropdown={toggleVariantDropdown}
                                disabled={disableFieldActions}
                            />
                        ) : null}
                        {isMultiple && !isWholeMultipleField ? (
                            <>
                                <button
                                    data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-left-button"
                                    className={
                                        multipleFieldToolbarButtonClasses
                                    }
                                    data-tooltip={
                                        direction === "vertical"
                                            ? "Move up"
                                            : "Move left"
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleMoveInstance(
                                            fieldMetadata,
                                            "previous"
                                        );
                                    }}
                                    disabled={
                                        disableFieldActions || disableMoveLeft
                                    }
                                >
                                    <MoveLeftIcon
                                        className={classNames({
                                            "visual-builder__rotate--90":
                                                direction === "vertical",
                                            [visualBuilderStyles()[
                                                "visual-builder__rotate--90"
                                            ]]: direction === "vertical",
                                        })}
                                        disabled={
                                            disableFieldActions ||
                                            disableMoveLeft
                                        }
                                    />
                                </button>

                                <button
                                    data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__move-right-button"
                                    className={
                                        multipleFieldToolbarButtonClasses
                                    }
                                    data-tooltip={
                                        direction === "vertical"
                                            ? "Move down"
                                            : "Move right"
                                    }
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleMoveInstance(
                                            fieldMetadata,
                                            "next"
                                        );
                                    }}
                                    disabled={
                                        disableFieldActions || disableMoveRight
                                    }
                                >
                                    <MoveRightIcon
                                        className={classNames({
                                            "visual-builder__rotate--90":
                                                direction === "vertical",
                                            [visualBuilderStyles()[
                                                "visual-builder__rotate--90"
                                            ]]: direction === "vertical",
                                        })}
                                        disabled={
                                            disableFieldActions ||
                                            disableMoveRight
                                        }
                                    />
                                </button>

                                {isModalEditable ? editButton : null}
                                {formButton}
                                {isReplaceAllowed ? replaceButton : null}

                                <button
                                    data-testid="visual-builder__focused-toolbar__multiple-field-toolbar__delete-button"
                                    className={
                                        multipleFieldToolbarButtonClasses
                                    }
                                    data-tooltip={"Delete"}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleDeleteInstance(fieldMetadata);
                                    }}
                                    disabled={disableFieldActions}
                                >
                                    <DeleteIcon />
                                </button>
                            </>
                        ) : (
                            <>
                                {isModalEditable ? editButton : null}
                                {isReplaceAllowed ? replaceButton : null}
                                {formButton}
                                {fieldSchema ? (
                                    <CommentIcon
                                        fieldMetadata={fieldMetadata}
                                        fieldSchema={fieldSchema}
                                        invertTooltipPosition={
                                            invertTooltipPosition
                                        }
                                    />
                                ) : null}
                            </>
                        )}

                        <div>
                            {fieldLocationData?.apps &&
                                fieldLocationData.apps.length > 0 && (
                                    <div
                                        className={classNames(
                                            visualBuilderStyles()[
                                                "visual-builder__field-location-icons-container"
                                            ]
                                        )}
                                    >
                                        <button
                                            key={`${fieldLocationData.apps[0].uid}`}
                                            title={
                                                fieldLocationData.apps[0].title
                                            }
                                            className={
                                                multipleFieldToolbarButtonClasses
                                            }
                                            data-tooltip={
                                                fieldLocationData.apps[0].title
                                            }
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                // Handle app icon click
                                                console.log(
                                                    "App clicked:",
                                                    fieldLocationData.apps[0]
                                                );
                                            }}
                                        >
                                            {fieldLocationData.apps[0].icon ? (
                                                <img
                                                    src={
                                                        fieldLocationData
                                                            .apps[0].icon
                                                    }
                                                    alt={
                                                        fieldLocationData
                                                            .apps[0].title
                                                    }
                                                    style={{
                                                        width: "16px",
                                                        height: "16px",
                                                        objectFit: "cover",
                                                    }}
                                                />
                                            ) : (
                                                <EmptyAppIcon />
                                            )}
                                        </button>

                                        <button
                                            ref={moreButtonRef}
                                            className={
                                                multipleFieldToolbarButtonClasses
                                            }
                                            data-tooltip={"More"}
                                            onClick={handleMoreIconClick}
                                        >
                                            <MoreIcon />
                                        </button>
                                    </div>
                                )}
                        </div>
                    </>
                </div>
            </div>
            {displayAllApps && (
                <FieldLocationAppList apps={fieldLocationData?.apps || []} />
            )}
        </div>
    );
}

export default FieldToolbarComponent;
