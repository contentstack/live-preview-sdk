import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import Config from "../../configManager/configManager";
import { ISchemaFieldMap } from "./types/index.types";
import { VisualBuilder } from "..";
import { visualBuilderStyles } from "../visualBuilder.style";

const getReason = (
    updateRestrictDueToRole: boolean,
    updateRestrictDueToNonLocalizableFields: boolean,
    updateRestrictDueToAudienceMode: boolean
): string => {
    switch (true) {
        case updateRestrictDueToRole:
            return "You have only read access to this field";
        case updateRestrictDueToNonLocalizableFields:
            return "Editing this field is restricted in localized entries";
        case updateRestrictDueToAudienceMode:
            return "Editing this field is restricted due to audience mode";
        default:
            return "";
    }
};

export const isFieldDisabled = (
    fieldSchemaMap: ISchemaFieldMap,
    eventDetails: VisualBuilderCslpEventDetails
): any => {
    const masterLocale = Config.get().stackDetails.masterLocale || "en-us";
    const updateRestrictDueToRole = Boolean(
        fieldSchemaMap?.field_metadata?.updateRestrict
    );
    let updateRestrictDueToAudienceMode = false;

    if (
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode &&
        !eventDetails.editableElement.classList.contains(
            visualBuilderStyles()["visual-builder__variant-field"]
        )
    ) {
        updateRestrictDueToAudienceMode = true;
    }

    const updateRestrictDueToNonLocalizableFields =
        Boolean(fieldSchemaMap?.non_localizable) &&
        masterLocale !== eventDetails.fieldMetadata.locale;

    return {
        isDisabled:
            updateRestrictDueToRole ||
            updateRestrictDueToNonLocalizableFields ||
            updateRestrictDueToAudienceMode,
        reason: getReason(
            updateRestrictDueToRole,
            updateRestrictDueToNonLocalizableFields,
            updateRestrictDueToAudienceMode
        ),
    };
};
