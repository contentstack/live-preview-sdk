import { CslpData } from "../../cslp/types/cslp.types";

export interface VisualBuilderCslpEventDetails {
    editableElement: Element;
    cslpData: string;
    fieldMetadata: CslpData;
}
