import {
    IContentTypeRootBlocks,
    IModularBlockSingleBlock,
} from "../../../types/contentTypeSchema.types";

export type ISchemaIndividualFieldMap = Record<string, ISchemaFieldMap>;

export type ISchemaFieldMap =
    | IContentTypeRootBlocks
    | (IModularBlockSingleBlock & {
          data_type: "block";
          display_name: string;
      });

export interface ITraverseSchemaVisitor {
    should_visit: (
        fieldSchema: IContentTypeRootBlocks,
        path: string
    ) => boolean;
    visit: (fieldSchema: IContentTypeRootBlocks, path: string) => void;

    /**
     * A flat list of all the fields with its schema
     */
    fieldMap: ISchemaIndividualFieldMap;
}
