import { CslpData } from "../../cslp/types/cslp.types";

export interface VisualEditorCslpEventDetails {
    editableElement: Element;
    cslpData: string;
    fieldMetadata: CslpData;
}
