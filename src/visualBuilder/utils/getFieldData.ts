import { CslpData } from "../../cslp/types/cslp.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import { hasPostMessageError } from "./errorHandling";

/**
 * Retrieves the expected field data based on the provided field metadata.
 *
 * @param fieldMetadata The metadata of the field.
 * @param entryPath The path in the entry for which the value must be returned.
 * @returns A promise that resolves to the expected field data as a string.
 */
export async function getFieldData(
    fieldMetadata: Pick<CslpData, "content_type_uid" | "entry_uid" | "locale">,
    entryPath?: string
): Promise<any> {
    const data = await visualBuilderPostMessage?.send<{ fieldData: unknown }>(
        VisualBuilderPostMessageEvents.GET_FIELD_DATA,
        { fieldMetadata, entryPath: entryPath ?? "" }
    );
    
    if(hasPostMessageError(data)){
        return "";
    }

    // toString from lodash
    // return toString(data?.fieldData);
    return data?.fieldData;
}
