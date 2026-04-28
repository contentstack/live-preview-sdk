import classNames from "classnames";
import React, { useEffect, useRef, useState } from "preact/compat";
import { extractDetailsFromCslp, isValidCslp } from "../../cslp";
import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { DisableReason, isFieldDisabled } from "../utils/isFieldDisabled";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { CaretIcon, CaretRightIcon, InfoIcon } from "./icons";
import { LoadingIcon } from "./icons/loading";
import { FieldTypeIconsMap, getFieldIcon } from "../generators/generateCustomCursor";
import { uniqBy } from "lodash-es";
import { visualBuilderStyles } from "../visualBuilder.style";
import { CslpError } from "./CslpError";
import { hasPostMessageError } from "../utils/errorHandling";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { ContentTypeIcon } from "./icons";
import { ToolbarTooltip } from "./Tooltip";
import { fetchEntryPermissionsAndStageDetails } from "../utils/fetchEntryPermissionsAndStageDetails";
import { VariantIndicator } from "./VariantIndicator";
import { handleRevalidateFieldData } from "../eventManager/useRevalidateFieldDataPostMessageEvent";
import { RESULT_TYPES } from "../utils/constants";

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
}

/** Space needed above the icon for the default (above) tooltip before flipping below. */
const TOOLTIP_VIEWPORT_TOP_CLEARANCE_PX = 148;

interface FieldLabelDisabledIconProps {
    reason: string;
    workflowRequestUi?: "request" | "pending";
    usePlainDataTooltip: boolean;
    onLinkVariant: () => void;
    onRequestEditAccess: () => void | Promise<void>;
}

function FieldLabelDisabledIcon(
    props: FieldLabelDisabledIconProps
): JSX.Element {
    const {
        reason,
        workflowRequestUi,
        usePlainDataTooltip,
        onLinkVariant,
        onRequestEditAccess,
    } = props;
    const wrapRef = useRef<HTMLDivElement>(null);
    const [showTooltipBelow, setShowTooltipBelow] = useState(false);

    const updateTooltipPlacement = () => {
        const el = wrapRef.current;
        if (!el) return;
        const { top } = el.getBoundingClientRect();
        setShowTooltipBelow(top < TOOLTIP_VIEWPORT_TOP_CLEARANCE_PX);
    };

    const customTooltipClass = classNames(
        visualBuilderStyles()["visual-builder__custom-tooltip"],
        showTooltipBelow &&
            visualBuilderStyles()["visual-builder__custom-tooltip--below"]
    );

    const workflowAccessTooltipClass = classNames(
        visualBuilderStyles()["visual-builder__custom-tooltip"],
        showTooltipBelow &&
            visualBuilderStyles()["visual-builder__custom-tooltip--below"],
        visualBuilderStyles()[
            "visual-builder__custom-tooltip--workflow-access"
        ]
    );

    return (
        <div
            ref={wrapRef}
            onMouseEnter={updateTooltipPlacement}
            className={classNames(
                visualBuilderStyles()["visual-builder__tooltip--persistent"],
                showTooltipBelow &&
                    visualBuilderStyles()[
                        "visual-builder__tooltip--persistent--below"
                    ]
            )}
            data-tooltip={usePlainDataTooltip ? reason : undefined}
        >
            {reason?.includes(DisableReason.CanLinkVariant) ? (
                <div className={customTooltipClass} onClick={onLinkVariant}>
                    {(() => {
                        const [before, after] = reason.split(
                            DisableReason.UnderlinedAndClickableWord
                        );
                        return (
                            <>
                                {before}
                                <span style={{ textDecoration: "underline" }}>
                                    {DisableReason.UnderlinedAndClickableWord}
                                </span>
                                {after}
                            </>
                        );
                    })()}
                </div>
            ) : null}
            {workflowRequestUi === "request" && reason ? (
                <div className={workflowAccessTooltipClass}>
                    <span>{reason}</span>{" "}
                    <span
                        role="button"
                        tabIndex={0}
                        style={{
                            textDecoration: "underline",
                            cursor: "pointer",
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onRequestEditAccess();
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onRequestEditAccess();
                            }
                        }}
                    >
                        Request Edit Access
                    </span>
                </div>
            ) : null}
            {workflowRequestUi === "pending" && reason ? (
                <div className={workflowAccessTooltipClass}>{reason}</div>
            ) : null}
            <InfoIcon />
        </div>
    );
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
                    ...props.parentPaths
                        .filter((path) => path)
                        .map((path) => {
                            return extractDetailsFromCslp(path);
                        }),
                ],
                "cslpValue"
            );
            const [displayNames, fieldSchema, contentTypeName, referenceParentMap] = await Promise.all([
                getFieldDisplayNames(allPaths),
                FieldSchemaMap.getFieldSchema(
                    props.fieldMetadata.content_type_uid,
                    props.fieldMetadata.fieldPath
                ),
                getContentTypeName(
                    props.fieldMetadata.content_type_uid
                ),
                getReferenceParentMap()
            ]);
            const entryUid = props.fieldMetadata.entry_uid;

            const referenceData = referenceParentMap[entryUid];
            const isReference = !!referenceData;

            let referenceFieldName = referenceData ? referenceData[0].referenceFieldName : "";
            let parentContentTypeName = referenceData ? referenceData[0].contentTypeTitle : "";

            if(isReference) {
                const domAncestor = eventDetails.editableElement.closest(`[data-cslp]:not([data-cslp^="${props.fieldMetadata.content_type_uid}"])`);
                if(domAncestor) {
                    const domAncestorCslp = domAncestor.getAttribute("data-cslp");
                    if (isValidCslp(domAncestorCslp)) {
                        const domAncestorDetails = extractDetailsFromCslp(domAncestorCslp);
                        const domAncestorContentTypeUid = domAncestorDetails.content_type_uid;
                        const domAncestorContentParent = referenceData?.find(data => data.contentTypeUid === domAncestorContentTypeUid);
                        if(domAncestorContentParent) {
                            referenceFieldName = domAncestorContentParent.referenceFieldName;
                            parentContentTypeName = domAncestorContentParent.contentTypeTitle;
                        }
                    }
                }
            }

            if (hasPostMessageError(displayNames) || !fieldSchema) {
                setDataLoading(false);
                setError(true);

                return;
            }

            const { acl: entryAcl, workflowStage: entryWorkflowStageDetails, resolvedVariantPermissions } =
                await fetchEntryPermissionsAndStageDetails({
                    entryUid: props.fieldMetadata.entry_uid,
                    contentTypeUid: props.fieldMetadata.content_type_uid,
                    locale: props.fieldMetadata.locale,
                    variantUid: props.fieldMetadata.variant,
                    fieldPathWithIndex: props.fieldMetadata.fieldPathWithIndex,
                });
            const {
                isDisabled: fieldDisabled,
                reason,
                workflowRequestUi,
            } = isFieldDisabled(
                fieldSchema,
                eventDetails,
                resolvedVariantPermissions,
                entryAcl,
                entryWorkflowStageDetails,
            );
            const handleRequestEditAccess = async () => {
                try {
                    await visualBuilderPostMessage?.send(
                        VisualBuilderPostMessageEvents.OPEN_REQUEST_EDIT_ACCESS,
                        {
                            entryUid: props.fieldMetadata.entry_uid,
                            contentTypeUid:
                                props.fieldMetadata.content_type_uid,
                            locale: props.fieldMetadata.locale,
                            variantUid: props.fieldMetadata.variant,
                        }
                    );
                } catch (error) {
                    console.error(
                        "Error opening request edit access flow:",
                        error
                    );
                }
            };

            const handleLinkVariant = async () => {
                try {
                    if (fieldSchema.field_metadata?.canLinkVariant) {
                        const result = await visualBuilderPostMessage?.send<{
                            type: typeof RESULT_TYPES.SUCCESS | typeof RESULT_TYPES.ERROR;
                            message: string;
                        }>(
                            VisualBuilderPostMessageEvents.OPEN_LINK_VARIANT_MODAL,
                            {
                                contentTypeUid:
                                    props.fieldMetadata.content_type_uid,
                            }
                        );

                        // If the modal was closed or linking failed, do nothing
                        if (!result || result.type === RESULT_TYPES.ERROR) {
                            return;
                        }

                        // If linking was successful and requires revalidation, revalidate
                        if (result.type === RESULT_TYPES.SUCCESS) {
                            await handleRevalidateFieldData();
                        }
                    }
                } catch (error) {
                    console.error(
                        "Error in link variant modal flow:",
                        error
                    );
                }
            };

            const currentFieldDisplayName =
                displayNames?.[props.fieldMetadata.cslpValue] ??
                fieldSchema.display_name;

            const hasParentPaths = !!props?.parentPaths?.length;
            const isVariant = props.fieldMetadata.variant ? true : false;

            const usePlainDataTooltip =
                reason &&
                !reason.includes(DisableReason.CanLinkVariant) &&
                workflowRequestUi == null;

            setCurrentField({
                text: currentFieldDisplayName,
                contentTypeName: contentTypeName ?? "",
                icon: fieldDisabled ? (
                    <FieldLabelDisabledIcon
                        reason={reason}
                        {...(workflowRequestUi != null
                            ? { workflowRequestUi }
                            : {})}
                        usePlainDataTooltip={Boolean(usePlainDataTooltip)}
                        onLinkVariant={handleLinkVariant}
                        onRequestEditAccess={handleRequestEditAccess}
                    />
                ) : hasParentPaths ? (
                    <CaretIcon />
                ) : (
                    <></>
                ),
                isReference,
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
            {currentField.isVariant ? <VariantIndicator /> : null}
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
                        },
                        {
                            "visual-builder__focused-toolbar--variant":
                                currentField.isVariant,
                        },
                        {
                            [visualBuilderStyles()[
                                "visual-builder__focused-toolbar--variant"
                            ]]: currentField.isVariant,
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
                                    data-testid="visual-builder__field-icon-caret"
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
