import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import Config from "../../configManager/configManager";
import { ISchemaFieldMap } from "./types/index.types";
import { VisualBuilder } from "..";
import { FieldDetails } from "../components/FieldToolbar";

const getReason = (
    updateRestrictDueToRole: boolean,
    updateRestrictDueToNonLocalizableFields: boolean,
    updateRestrictDueToAudienceMode: boolean,
    updateRestrictDueToDisabledVariant: boolean
): string => {
    switch (true) {
        case updateRestrictDueToRole:
            return "You have only read access to this field";
        case updateRestrictDueToNonLocalizableFields:
            return "Editing this field is restricted in localized entries";
        case updateRestrictDueToAudienceMode:
            return "Open an Experience from Audience widget to start editing";
        case updateRestrictDueToDisabledVariant:
            return "This field is not editable as it doesn't match the selected variant";
        default:
            return "";
    }
};

export const isFieldDisabled = (
    fieldSchemaMap: ISchemaFieldMap,
    eventFieldDetails: FieldDetails
): any => {
    const { editableElement, fieldMetadata } = eventFieldDetails;
    const masterLocale = Config.get().stackDetails.masterLocale || "en-us";
    const updateRestrictDueToRole = Boolean(
        fieldSchemaMap?.field_metadata?.updateRestrict
    );
    let updateRestrictDueToAudienceMode = false;
    let updateRestrictDueToDisabledVariant = false;

    if (
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode &&
        !editableElement.classList.contains("visual-builder__variant-field") &&
        !editableElement.classList.contains("visual-builder__base-field")
    ) {
        if (
            editableElement.classList.contains(
                "visual-builder__disabled-variant-field"
            )
        ) {
            updateRestrictDueToDisabledVariant = true;
        } else {
            updateRestrictDueToAudienceMode = true;
        }
    }

    const updateRestrictDueToNonLocalizableFields =
        Boolean(fieldSchemaMap?.non_localizable) &&
        masterLocale !== fieldMetadata.locale;

    return {
        isDisabled:
            updateRestrictDueToRole ||
            updateRestrictDueToNonLocalizableFields ||
            updateRestrictDueToAudienceMode ||
            updateRestrictDueToDisabledVariant,
        reason: getReason(
            updateRestrictDueToRole,
            updateRestrictDueToNonLocalizableFields,
            updateRestrictDueToAudienceMode,
            updateRestrictDueToDisabledVariant
        ),
    };
};
