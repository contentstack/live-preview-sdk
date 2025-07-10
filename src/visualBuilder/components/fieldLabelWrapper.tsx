import classNames from "classnames";
import React, { useEffect, useState } from "preact/compat";
import { extractDetailsFromCslp } from "../../cslp";
import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { CaretIcon, CaretRightIcon, InfoIcon } from "./icons";
import { LoadingIcon } from "./icons/loading";
import { FieldTypeIconsMap, getFieldIcon } from "../generators/generateCustomCursor";
import { uniqBy } from "lodash-es";
import { visualBuilderStyles } from "../visualBuilder.style";
import { CslpError } from "./CslpError";
import { hasPostMessageError } from "../utils/errorHandling";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { getEntryPermissionsCached } from "../utils/getEntryPermissionsCached";
import { ContentTypeIcon } from "./icons";
import { ToolbarTooltip } from "./Tooltip";

interface ReferenceParentMap {
    [entryUid: string]: {
        contentTypeUid: string;
        contentTypeTitle: string;
        referenceFieldName: string;
    }[]
}

async function getFieldDisplayNames(fieldMetadata: CslpData[]) {
    const result = await visualBuilderPostMessage?.send<{
        [k: string]: string;
    }>(VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES, fieldMetadata);
    return result;
}

async function getContentTypeName(contentTypeUid: string) {
    try {
        const result = await visualBuilderPostMessage?.send<{
            contentTypeName: string;
        }>(VisualBuilderPostMessageEvents.GET_CONTENT_TYPE_NAME, {
            content_type_uid: contentTypeUid,
        });
        return result?.contentTypeName;
    } catch(e) {
        console.warn("[getFieldLabelWrapper] Error getting content type name", e);
        return "";
    }
}

async function getReferenceParentMap() {
    try {
        const result = await visualBuilderPostMessage?.send<ReferenceParentMap>(VisualBuilderPostMessageEvents.REFERENCE_MAP, {}) ?? {};
        return result;
    } catch(e) {
        console.warn("[getFieldLabelWrapper] Error getting reference parent map", e);
        return {};
    }
    
}

interface FieldLabelWrapperProps {
    fieldMetadata: CslpData;
    eventDetails: VisualBuilderCslpEventDetails;
    parentPaths: string[];
    getParentEditableElement: (cslp: string) => HTMLElement | null;
}

interface ICurrentField {
    text: string;
    contentTypeName: string;
    icon: JSX.Element;
    prefixIcon: any;
    disabled: boolean;
    isVariant: boolean;
    isReference: boolean;
    referenceFieldName: string;
    parentContentTypeName: string;
    isEmbedded: boolean;
}

function FieldLabelWrapperComponent(
    props: FieldLabelWrapperProps
): JSX.Element {
    const { eventDetails } = props;
    const [currentField, setCurrentField] = useState<ICurrentField>({
        text: "",
        contentTypeName: "",
        icon: <CaretIcon />,
        prefixIcon: null,
        disabled: false,
        isVariant: false,
        isReference: false,
        referenceFieldName: "",
        parentContentTypeName: "",
        isEmbedded: false,
    });
    const [displayNames, setDisplayNames] = useState<Record<string, string>>(
        {}
    );
    const [dataLoading, setDataLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function calculateTopOffset(index: number) {
        const height = -30; // from bottom
        const offset = (index + 1) * height;
        return `${offset}px`;
    }

    useEffect(() => {
        const fetchData = async () => {
            setDataLoading(true);
            const allPaths = uniqBy(
                [
                    props.fieldMetadata,
                    ...props.parentPaths.map((path) => {
                        return extractDetailsFromCslp(path);
                    }),
                ],
                "cslpValue"
            );
            const [displayNames, fieldSchema] = await Promise.all([
                getFieldDisplayNames(allPaths),
                FieldSchemaMap.getFieldSchema(
                    props.fieldMetadata.content_type_uid,
                    props.fieldMetadata.fieldPath
                )
            ]);
            const contentTypeName = await getContentTypeName(
                props.fieldMetadata.content_type_uid
            );
            const referenceParentMap = await getReferenceParentMap();
            const entryUid = props.fieldMetadata.entry_uid;
            
            const referenceData = referenceParentMap[entryUid];
            const isReference = !!referenceData;

            let referenceFieldName = referenceData ? referenceData[0].referenceFieldName : "";
            let parentContentTypeName = referenceData ? referenceData[0].contentTypeTitle : "";

            if(isReference) {
                const domAncestor = eventDetails.editableElement.closest(`[data-cslp]:not([data-cslp^="${props.fieldMetadata.content_type_uid}"])`);
                if(domAncestor) {
                    const domAncestorCslp = domAncestor.getAttribute("data-cslp");
                    const domAncestorDetails = extractDetailsFromCslp(domAncestorCslp!);
                    const domAncestorContentTypeUid = domAncestorDetails.content_type_uid;
                    const domAncestorContentParent = referenceData?.find(data => data.contentTypeUid === domAncestorContentTypeUid);
                    if(domAncestorContentParent) {
                        referenceFieldName = domAncestorContentParent.referenceFieldName;
                        parentContentTypeName = domAncestorContentParent.contentTypeTitle;
                    }
                }
            }

            if (hasPostMessageError(displayNames) || !fieldSchema) {
                setDataLoading(false);
                setError(true);

                return;
            }

            const entryPermissions = await getEntryPermissionsCached({
                entryUid: props.fieldMetadata.entry_uid,
                contentTypeUid: props.fieldMetadata.content_type_uid,
                locale: props.fieldMetadata.locale,
            });
            const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
                fieldSchema,
                eventDetails,
                entryPermissions
            );

            const currentFieldDisplayName =
                displayNames?.[props.fieldMetadata.cslpValue] ??
                fieldSchema.display_name;

            const hasParentPaths = !!props?.parentPaths?.length;
            const isVariant = props.fieldMetadata.variant ? true : false;

            setCurrentField({
                text: currentFieldDisplayName,
                contentTypeName: contentTypeName ?? "",
                icon: fieldDisabled ? (
                    <div
                        className={classNames(
                            visualBuilderStyles()[
                                "visual-builder__tooltip--persistent"
                            ]
                        )}
                        data-tooltip={reason}
                    >
                        <InfoIcon />
                    </div>
                ) : hasParentPaths ? (
                    <CaretIcon />
                ) : (
                    <></>
                ),
                isReference,
                isEmbedded: false,
                prefixIcon: getFieldIcon(fieldSchema),
                disabled: fieldDisabled,
                referenceFieldName,
                parentContentTypeName,
                isVariant: isVariant,
            });

            if (displayNames) {
                setDisplayNames(displayNames);
            }
            if (Object.keys(displayNames || {})?.length === allPaths.length) {
                setDataLoading(false);
            }
        };

        try {
            fetchData();
        } catch(e) {
            console.warn("[getFieldLabelWrapper] Error fetching field label data", e);
        }
    }, [props]);

    const onParentPathClick = (cslp: string) => {
        const parentElement = props.getParentEditableElement(cslp);
        if (parentElement) {
            // emulate clicking on the parent element
            parentElement.click();
        }
    };

    function getCurrentFieldIcon() {
        if (error) {
            return null;
        } else if (dataLoading) {
            return <LoadingIcon />;
        } else {
            return currentField.icon;
        }
    }

    return (
        <div
            className={classNames(
                "visual-builder__focused-toolbar__field-label-container",
                visualBuilderStyles()[
                    "visual-builder__focused-toolbar__field-label-container"
                ]
            )}
        >
            <ToolbarTooltip data={{contentTypeName: currentField.parentContentTypeName, referenceFieldName: currentField.referenceFieldName}} disabled={!currentField.isReference || isDropdownOpen}>
                <div
                    className={classNames(
                        "visual-builder__focused-toolbar__field-label-wrapper",
                        visualBuilderStyles()[
                            "visual-builder__focused-toolbar__field-label-wrapper"
                        ],
                        {
                            "visual-builder__focused-toolbar--field-disabled":
                                currentField.disabled,
                        },
                        {
                            [visualBuilderStyles()[
                                "visual-builder__focused-toolbar--field-disabled"
                            ]]: currentField.disabled,
                        },
                        {
                            "field-label-dropdown-open": isDropdownOpen,
                            [visualBuilderStyles()["field-label-dropdown-open"]]:
                                isDropdownOpen,
                        }
                    )}
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    data-testid="visual-builder__focused-toolbar__field-label-wrapper"
                    data-hovered-cslp={props.fieldMetadata.cslpValue}
                >
                    <button
                        className={classNames(
                            "visual-builder__focused-toolbar__field-label-wrapper__current-field visual-builder__button visual-builder__button--primary visual-builder__button-loader",
                            visualBuilderStyles()[
                                "visual-builder__focused-toolbar__field-label-wrapper__current-field"
                            ],
                            visualBuilderStyles()["visual-builder__button"],
                            visualBuilderStyles()[
                                "visual-builder__button--primary"
                            ],
                            visualBuilderStyles()["visual-builder__button-loader"],
                            error &&
                                visualBuilderStyles()[
                                    "visual-builder__button-error"
                                ]
                        )}
                        disabled={dataLoading}
                    >
                        {
                            currentField.isReference && !dataLoading && !error ? 
                            <div 
                            className={classNames(
                                "visual-builder__reference-icon-container",
                                visualBuilderStyles()["visual-builder__reference-icon-container"]
                            )}
                            >
                                <div
                                    className={classNames(
                                        "visual-builder__field-icon",
                                        visualBuilderStyles()[
                                            "visual-builder__field-icon"
                                        ]
                                    )}
                                    dangerouslySetInnerHTML={{
                                        __html: FieldTypeIconsMap.reference,
                                    }}
                                    data-testid="visual-builder__field-icon"
                                />
                                <CaretRightIcon />
                            </div> : null
                        }
                        {
                            currentField.contentTypeName && !dataLoading && !error ?
                            <>
                                <ContentTypeIcon />
                                <div
                                    className={classNames(
                                        "visual-builder__focused-toolbar__text",
                                        visualBuilderStyles()[
                                            "visual-builder__focused-toolbar__text"
                                        ]
                                    )}
                                    data-testid="visual-builder__focused-toolbar__ct-name"
                                >
                                    {currentField.contentTypeName + " : "}
                                </div>
                            </> : null
                        }
                        {currentField.prefixIcon ? (
                            <div
                                className={classNames(
                                    "visual-builder__field-icon",
                                    visualBuilderStyles()[
                                        "visual-builder__field-icon"
                                    ]
                                )}
                                dangerouslySetInnerHTML={{
                                    __html: currentField.prefixIcon,
                                }}
                                data-testid="visual-builder__field-icon"
                            />
                        ) : null}
                        {currentField.text ? (
                            <div
                                className={classNames(
                                    "visual-builder__focused-toolbar__text",
                                    visualBuilderStyles()[
                                        "visual-builder__focused-toolbar__text"
                                    ]
                                )}
                                data-testid="visual-builder__focused-toolbar__text"
                            >
                                {currentField.text}
                            </div>
                        ) : null}
                        {getCurrentFieldIcon()}
                        {error ? <CslpError /> : null}
                    </button>
                    {props.parentPaths.map((path, index) => (
                        <button
                            key={path}
                            className={classNames(
                                "visual-builder__focused-toolbar__field-label-wrapper__parent-field visual-builder__button visual-builder__button--secondary visual-builder__focused-toolbar__text",
                                visualBuilderStyles()[
                                    "visual-builder__focused-toolbar__field-label-wrapper__parent-field"
                                ],
                                visualBuilderStyles()["visual-builder__button"],
                                visualBuilderStyles()[
                                    "visual-builder__button--secondary"
                                ],
                                visualBuilderStyles()[
                                    "visual-builder__focused-toolbar__text"
                                ]
                            )}
                            data-target-cslp={path}
                            style={{ top: calculateTopOffset(index) }}
                            onClick={() => onParentPathClick(path)}
                        >
                            {displayNames[path]}
                        </button>
                    ))}
                </div>
            </ToolbarTooltip>
        </div>
    );
}

export default FieldLabelWrapperComponent;
