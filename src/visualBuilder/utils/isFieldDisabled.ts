import { VisualBuilderCslpEventDetails } from "../types/visualBuilder.types";
import Config from "../../configManager/configManager";
import { ISchemaFieldMap } from "./types/index.types";
import { VisualBuilder } from "..";
import { FieldDetails } from "../components/FieldToolbar";
import { EntryPermissions } from "./getEntryPermissions";

enum DisableReason {
    ReadOnly = "You have only read access to this field",
    LocalizedEntry = "Editing this field is restricted in localized entries",
    UnlinkedVariant = "This field is not editable as it is not linked to the selected variant",
    AudienceMode = "Open an Experience from Audience widget to start editing",
    DisabledVariant = "This field is not editable as it doesn't match the selected variant",
    UnlocalizedVariant = "This field is not editable as it is not localized",
    None = "",
    EntryUpdateRestricted = "You do not have permission to edit this entry",
}

interface FieldDisableState {
    isDisabled: boolean;
    reason: DisableReason;
}

const getDisableReason = (flags: Record<string, boolean>): DisableReason => {
    if (flags.updateRestrictDueToEntryUpdateRestriction) {
        return DisableReason.EntryUpdateRestricted;
    }
    if (flags.updateRestrictDueToRole) return DisableReason.ReadOnly;
    if (flags.updateRestrictDueToNonLocalizableFields)
        return DisableReason.LocalizedEntry;
    if (flags.updateRestrictDueToUnlocalizedVariant)
        return DisableReason.UnlocalizedVariant;
    if (flags.updateRestrictDueToUnlinkVariant)
        return DisableReason.UnlinkedVariant;
    if (flags.updateRestrictDueToAudienceMode)
        return DisableReason.AudienceMode;
    if (flags.updateRestrictDueToDisabledVariant)
        return DisableReason.DisabledVariant;
    return DisableReason.None;
};

export const isFieldDisabled = (
    fieldSchemaMap: ISchemaFieldMap,
    eventFieldDetails: FieldDetails,
    entryPermissions?: EntryPermissions
): FieldDisableState => {
    const { editableElement, fieldMetadata } = eventFieldDetails;
    const masterLocale = Config.get().stackDetails.masterLocale || "en-us";
    const { locale: cmsLocale, variant } =
        VisualBuilder.VisualBuilderGlobalState.value;

    const flags: Record<string, boolean> = {
        updateRestrictDueToRole: Boolean(
            fieldSchemaMap?.field_metadata?.updateRestrict
        ),
        updateRestrictDueToUnlinkVariant: Boolean(
            fieldSchemaMap?.field_metadata?.isUnlinkedVariant
        ),
        updateRestrictDueToUnlocalizedVariant: Boolean(
            variant && fieldMetadata.locale !== cmsLocale
        ),
        updateRestrictDueToNonLocalizableFields: Boolean(
            fieldSchemaMap?.non_localizable &&
                masterLocale !== fieldMetadata.locale
        ),
        updateRestrictDueToAudienceMode: false,
        updateRestrictDueToDisabledVariant: false,
    };

    if (entryPermissions && !entryPermissions.update) {
        flags.updateRestrictDueToEntryUpdateRestriction = true;
    }

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
            flags.updateRestrictDueToDisabledVariant = true;
        } else {
            flags.updateRestrictDueToAudienceMode = true;
        }
    }

    const isDisabled = Object.values(flags).some(Boolean);
    const reason = getDisableReason(flags);

    return { isDisabled, reason };
};
