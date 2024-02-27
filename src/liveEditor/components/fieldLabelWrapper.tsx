import { useEffect, useState } from "react";
import { CslpData } from "../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { isFieldDisabled } from "../utils/isFieldDisabled";
import { CaretIcon, InfoIcon } from "./icons";
import { extractDetailsFromCslp } from "../../cslp";

interface FieldLabelWrapperProps {
    fieldMetadata: CslpData;
    eventDetails: VisualEditorCslpEventDetails;
    parentPaths: string[];
}

function FieldLabelWrapperComponent(props: FieldLabelWrapperProps) {
    const [currentField, setCurrentField] = useState({
        text: "",
        icon: <CaretIcon />,
        disabled: false,
    });
    const [displayNames, setDisplayNames] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const fieldSchema = await FieldSchemaMap.getFieldSchema(
                props.fieldMetadata.content_type_uid,
                props.fieldMetadata.fieldPath
            );
            const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
                fieldSchema,
                props.eventDetails
            );

            setCurrentField({
                text: fieldSchema.display_name,
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

            const displayNames = await Promise.all(
                props.parentPaths.map(async (path) => {
                    const { content_type_uid, fieldPath } =
                        extractDetailsFromCslp(path);
                    const fieldSchema = await FieldSchemaMap.getFieldSchema(
                        content_type_uid,
                        fieldPath
                    );
                    return fieldSchema.display_name;
                })
            );

            setDisplayNames(displayNames);
        };

        fetchData();
    }, [props]);

    return (
        <div
            className={`visual-editor__focused-toolbar__field-label-wrapper ${
                currentField.disabled
                    ? "visual-editor__focused-toolbar--field-disabled"
                    : ""
            }`}
        >
            <div className="visual-editor__focused-toolbar__field-label-wrapper__current-field visual-editor__button visual-editor__button--primary">
                <div className="visual-editor__focused-toolbar__text">
                    {currentField.text}
                </div>
                {currentField.icon}
            </div>
            {props.parentPaths.map((path, index) => (
                <div
                    key={index}
                    className="visual-editor__focused-toolbar__field-label-wrapper__parent-field visual-editor__button visual-editor__button--secondary visual-editor__focused-toolbar__text"
                    data-target-cslp={path}
                    style={{ top: `-${(index + 1) * 30}px` }}
                >
                    {displayNames[index]}
                </div>
            ))}
        </div>
    );
}

export default FieldLabelWrapperComponent;
