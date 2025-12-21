import { ISchemaFieldMap } from "./types/index.types";

export function isFieldMultiple(fieldSchema: ISchemaFieldMap): boolean {
    return (
        fieldSchema &&
        (fieldSchema.multiple ||
            (fieldSchema.data_type === "reference" &&
                // @ts-expect-error field_metadata will contain ref_multiple
                // for reference fields
                fieldSchema.field_metadata.ref_multiple))
    );
}
