import { ISchemaFieldMap } from "../liveEditor/utils/types/index.types";
import { CslpData } from "./cslp.types";

export interface VisualEditorCslpEventDetails {
    editableElement: Element;
    cslpData: string;
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
}
