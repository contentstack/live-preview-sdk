import classNames from "classnames";
import React, { useEffect, useState } from "preact/compat";
import { extractDetailsFromCslp } from "../../cslp";
import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { CaretIcon, InfoIcon, WarningOctagonIcon } from "./icons";
import { LoadingIcon } from "./icons/loading";
import { getFieldIcon } from "../generators/generateCustomCursor";
import { uniqBy } from "lodash-es";
import { visualBuilderStyles } from "../visualBuilder.style";
import { VariantIcon } from "./icons/variant";
import { CslpError } from "./CslpError";

async function getFieldDisplayNames(fieldMetadata: CslpData[]) {
    const result = await visualBuilderPostMessage?.send<{
        [k: string]: string;
    }>("get-field-display-names", fieldMetadata);
    return result;
}

interface FieldLabelWrapperProps {
    fieldMetadata: CslpData;
    eventDetails: VisualBuilderCslpEventDetails;
    parentPaths: string[];
    getParentEditableElement: (cslp: string) => HTMLElement | null;
}

function FieldLabelWrapperComponent(
    props: FieldLabelWrapperProps
): JSX.Element {
    const { eventDetails } = props;
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
    const [error, setError] = useState(false)
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
            
            if(!fieldSchema){
                setError(true)
                setDisplayNamesLoading(false)
                return; 
            }
            
            const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
                fieldSchema,
                eventDetails
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
        >
            <button
                className={classNames(
                    "visual-builder__focused-toolbar__field-label-wrapper__current-field visual-builder__button visual-builder__button--primary visual-builder__button-loader",
                    visualBuilderStyles()[
                        "visual-builder__focused-toolbar__field-label-wrapper__current-field"
                    ],
                    visualBuilderStyles()["visual-builder__button"],
                    visualBuilderStyles()["visual-builder__button--primary"],
                    visualBuilderStyles()["visual-builder__button-loader"],
                    error &&
                        visualBuilderStyles()["visual-builder__button-error"]
                )}
                disabled={displayNamesLoading}
            >
                {currentField.prefixIcon ? (
                    <div
                        className={classNames(
                            "visual-builder__field-icon",
                            visualBuilderStyles()["visual-builder__field-icon"]
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
                            visualBuilderStyles()[
                                "visual-builder__focused-toolbar__text"
                            ]
                        )}
                    >
                        {currentField.text}
                    </div>
                ) : null}
                {error ? null : displayNamesLoading ? (
                    <LoadingIcon />
                ) : (
                    currentField.icon
                )}
                {error ? (
                   <CslpError /> 
                ) : null}
                {currentField.isVariant ? (
                    <div
                        className={classNames(
                            "visual-builder__field-icon",
                            visualBuilderStyles()["visual-builder__field-icon"]
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
    );
}

export default FieldLabelWrapperComponent;
