import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import Config from "../../utils/configHandler";
import { ISchemaFieldMap } from "./types/index.types";

export const isFieldDisabled = (
    fieldSchemaMap: ISchemaFieldMap,
    eventDetails: VisualEditorCslpEventDetails
) => {
    const masterLocale = Config.get()?.stackDetails?.masterLocale || "en-us";
    const updateRestrictDueToRole = Boolean(
        fieldSchemaMap?.field_metadata?.updateRestrict
    );
    const updateRestrictDueToNonLocalizableFields =
        Boolean(fieldSchemaMap?.non_localizable) &&
        masterLocale !== eventDetails.fieldMetadata.locale;

    return {
        isDisabled:
            updateRestrictDueToRole || updateRestrictDueToNonLocalizableFields,
        reason: updateRestrictDueToRole
            ? "You have only read access to this field"
            : "Editing this field is restricted in localized entries",
    };
};
