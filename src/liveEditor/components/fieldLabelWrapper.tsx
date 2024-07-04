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
}

function FieldLabelWrapperComponent(
    props: FieldLabelWrapperProps
): JSX.Element {
    const [currentField, setCurrentField] = useState({
        text: "",
        icon: <CaretIcon />,
        disabled: false,
    });
    const [displayNames, setDisplayNames] = useState<Record<string, string>>(
        {}
    );

    function calculateTopOffset(index: number) {
        const height = -30; // from bottom
        const offset = (index + 1) * height;
        return `${offset}px`;
    }

    useEffect(() => {
        const fetchData = async () => {
            const displayNames = await getFieldDisplayNames([
                props.fieldMetadata,
                ...props.parentPaths.map((path) => {
                    return extractDetailsFromCslp(path);
                }),
            ]);

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
            setCurrentField({
                text: currentFieldDisplayName,
                icon: fieldDisabled ? (
                    <div
                        className="visual-editor__tooltip"
                        data-tooltip={reason}
                    >
                        <InfoIcon />
                    </div>
                ) : (
                    <CaretIcon />
                ),
                disabled: fieldDisabled,
            });

            if (displayNames) {
                setDisplayNames(displayNames);
            }
        };

        fetchData();
    }, [props]);

    // keep the dropdown button disabled till the parent path display
    // names have loaded (displayNames should have at least 2 value -
    // current field plus one - for the dropdown to be enabled)
    const areDisplayNamesLoading = Boolean(
        props.parentPaths.length !== 0 && Object.values(displayNames).length < 2
    );

    return (
        <div
            className={classNames(
                "visual-editor__focused-toolbar__field-label-wrapper",
                {
                    "visual-editor__focused-toolbar--field-disabled":
                        currentField.disabled,
                }
            )}
        >
            <button
                className="visual-editor__focused-toolbar__field-label-wrapper__current-field visual-editor__button visual-editor__button--primary"
                disabled={areDisplayNamesLoading}
            >
                <div className="visual-editor__focused-toolbar__text">
                    {currentField.text}
                </div>
                {areDisplayNamesLoading ? (
                    <LoadingIcon height={14} width={14} />
                ) : (
                    currentField.icon
                )}
            </button>
            {props.parentPaths.map((path, index) => (
                <button
                    key={path}
                    className="visual-editor__focused-toolbar__field-label-wrapper__parent-field visual-editor__button visual-editor__button--secondary visual-editor__focused-toolbar__text"
                    data-target-cslp={path}
                    style={{ top: calculateTopOffset(index) }}
                >
                    {displayNames[path]}
                </button>
            ))}
        </div>
    );
}

export default FieldLabelWrapperComponent;
