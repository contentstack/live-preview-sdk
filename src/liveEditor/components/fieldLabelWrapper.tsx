import classNames from "classnames";
import { useEffect, useState } from "react";

import { extractDetailsFromCslp } from "../../cslp";
import { CslpData } from "../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { CaretIcon, InfoIcon } from "./icons";
import { LoadingIcon } from "./icons/loading";
import { getFieldIcon } from "../generators/generateCustomCursor";
import { uniqBy } from "lodash-es";
import { liveEditorStyles } from "../liveEditor.style";
import { VariantIcon } from "./icons/variant";

async function getFieldDisplayNames(fieldMetadata: CslpData[]) {
    const result = await liveEditorPostMessage?.send<{ [k: string]: string }>(
        "get-field-display-names",
        fieldMetadata
    );
    return result;
}

interface FieldLabelWrapperProps {
    fieldMetadata: CslpData;
    eventDetails: VisualEditorCslpEventDetails;
    parentPaths: string[];
    getParentEditableElement: (cslp: string) => HTMLElement | null;
}

function FieldLabelWrapperComponent(
    props: FieldLabelWrapperProps
): JSX.Element {
    const [currentField, setCurrentField] = useState({
        text: "",
        icon: <CaretIcon />,
        prefixIcon: null,
        disabled: false,
        isVariant: false,
    });
    const [displayNames, setDisplayNames] = useState<Record<string, string>>(
        {}
    );
    const [displayNamesLoading, setDisplayNamesLoading] = useState(true);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    function calculateTopOffset(index: number) {
        const height = -30; // from bottom
        const offset = (index + 1) * height;
        return `${offset}px`;
    }

    useEffect(() => {
        const fetchData = async () => {
            setDisplayNamesLoading(true);
            const allPaths = uniqBy(
                [
                    props.fieldMetadata,
                    ...props.parentPaths.map((path) => {
                        return extractDetailsFromCslp(path);
                    }),
                ],
                "cslpValue"
            );
            const displayNames = await getFieldDisplayNames(allPaths);

            const fieldSchema = await FieldSchemaMap.getFieldSchema(
                props.fieldMetadata.content_type_uid,
                props.fieldMetadata.fieldPath
            );
            const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
                fieldSchema,
                props.eventDetails
            );

            const currentFieldDisplayName =
                displayNames?.[props.fieldMetadata.cslpValue] ??
                fieldSchema.display_name;

            const hasParentPaths = !!props?.parentPaths?.length;
            const isVariant = props.fieldMetadata.variant ? true : false;

            setCurrentField({
                text: currentFieldDisplayName,
                icon: fieldDisabled ? (
                    <div
                        className="visual-builder__tooltip"
                        data-tooltip={reason}
                    >
                        <InfoIcon />
                    </div>
                ) : hasParentPaths ? (
                    <CaretIcon />
                ) : (
                    <></>
                ),
                prefixIcon: getFieldIcon(fieldSchema),
                disabled: fieldDisabled,
                isVariant: isVariant,
            });

            if (displayNames) {
                setDisplayNames(displayNames);
            }
            if (Object.keys(displayNames || {})?.length === allPaths.length) {
                setDisplayNamesLoading(false);
            }
        };

        fetchData();
    }, [props]);

    const onParentPathClick = (cslp: string) => {
        const parentElement = props.getParentEditableElement(cslp);
        if (parentElement) {
            // emulate clicking on the parent element
            parentElement.click();
        }
    };

    return (
        <div
            className={classNames(
                "visual-builder__focused-toolbar__field-label-wrapper",
                liveEditorStyles()[
                    "visual-builder__focused-toolbar__field-label-wrapper"
                ],
                {
                    "visual-builder__focused-toolbar--field-disabled":
                        currentField.disabled,
                },
                {
                    [liveEditorStyles()[
                        "visual-builder__focused-toolbar--field-disabled"
                    ]]: currentField.disabled,
                },
                {
                    "field-label-dropdown-open": isDropdownOpen,
                    [liveEditorStyles()["field-label-dropdown-open"]]:
                        isDropdownOpen,
                }
            )}
            onClick={() => setIsDropdownOpen((prev) => !prev)}
        >
            <button
                className={classNames(
                    "visual-builder__focused-toolbar__field-label-wrapper__current-field visual-builder__button visual-builder__button--primary visual-editor__button-loader",
                    liveEditorStyles()[
                        "visual-builder__focused-toolbar__field-label-wrapper__current-field"
                    ],
                    liveEditorStyles()["visual-builder__button"],
                    liveEditorStyles()["visual-builder__button--primary"],
                    liveEditorStyles()["visual-editor__button-loader"]
                )}
                disabled={displayNamesLoading}
            >
                {currentField.prefixIcon ? (
                    <div
                        className={classNames(
                            "visual-builder__field-icon",
                            liveEditorStyles()["visual-builder__field-icon"]
                        )}
                        dangerouslySetInnerHTML={{
                            __html: currentField.prefixIcon,
                        }}
                    />
                ) : null}
                {currentField.text ? (
                    <div
                        className={classNames(
                            "visual-builder__focused-toolbar__text",
                            liveEditorStyles()[
                                "visual-builder__focused-toolbar__text"
                            ]
                        )}
                    >
                        {currentField.text}
                    </div>
                ) : null}
                {displayNamesLoading ? <LoadingIcon /> : currentField.icon}
                {currentField.isVariant ? (
                    <div
                        className={classNames(
                            "visual-builder__field-icon",
                            liveEditorStyles()["visual-builder__field-icon"]
                        )}
                    >
                        <VariantIcon />
                    </div>
                ) : null}
            </button>
            {props.parentPaths.map((path, index) => (
                <button
                    key={path}
                    className={classNames(
                        "visual-builder__focused-toolbar__field-label-wrapper__parent-field visual-builder__button visual-builder__button--secondary visual-builder__focused-toolbar__text",
                        liveEditorStyles()[
                            "visual-builder__focused-toolbar__field-label-wrapper__parent-field"
                        ],
                        liveEditorStyles()["visual-builder__button"],
                        liveEditorStyles()["visual-builder__button--secondary"],
                        liveEditorStyles()[
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
    );
}

export default FieldLabelWrapperComponent;
