import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

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
    const data = await liveEditorPostMessage?.send<{ fieldData: unknown }>(
        LiveEditorPostMessageEvents.GET_FIELD_DATA,
        { fieldMetadata, entryPath: entryPath ?? "" }
    );

    // toString from lodash
    // return toString(data?.fieldData);
    return data?.fieldData;
}
