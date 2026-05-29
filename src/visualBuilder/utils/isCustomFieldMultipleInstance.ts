import { CslpData } from "../../cslp/types/cslp.types";
import { FieldDataType, ISchemaFieldMap } from "./types/index.types";
import { getFieldType } from "./getFieldType";
import { isFieldMultiple } from "./isFieldMultiple";

export function isCustomFieldMultipleInstance(
    fieldSchema: ISchemaFieldMap | null | undefined,
    fieldMetadata: CslpData | null | undefined
): boolean {
    if (!fieldSchema || !fieldMetadata) return false;
    return (
        getFieldType(fieldSchema) === FieldDataType.CUSTOM_FIELD &&
        isFieldMultiple(fieldSchema) &&
        fieldMetadata.fieldPathWithIndex !== fieldMetadata.instance?.fieldPathWithIndex &&
        (fieldMetadata.multipleFieldMetadata?.index ?? -1) !== -1
    );
}
