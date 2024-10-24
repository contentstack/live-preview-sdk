export interface CslpData {
    entry_uid: string;
    content_type_uid: string;
    cslpValue: string;
    locale: string;
    variant: string | undefined;
    /**
     * This path excludes the indexes in the Group or Modular blocks.
     * This path could be used to traverse in the content type schema.
     */
    fieldPath: string;
    /**
     * This path includes the indexes in the Group or Modular blocks.
     * This path could be used to traverse in the entry schema.
     */
    fieldPathWithIndex: string;
    multipleFieldMetadata: CslpDataMultipleFieldMetadata;
    instance: {
        fieldPathWithIndex: string;
    }
}

export interface CslpDataMultipleFieldMetadata {
    index: number;
    /**
     * It contains the path of the parent group, modular block, reference, or field.
     */
    parentDetails: CslpDataParentDetails | null;
}

export interface CslpDataParentDetails {
    parentPath: string;
    parentCslpValue: string;
}
