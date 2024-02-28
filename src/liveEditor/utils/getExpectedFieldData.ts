import { toString } from "lodash-es";
import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

/**
 * Retrieves the expected field data based on the provided field metadata.
 *
 * @param fieldMetadata The metadata of the field.
 * @returns A promise that resolves to the expected field data as a string.
 */
export async function getExpectedFieldData(
    fieldMetadata: CslpData
): Promise<string> {
    const data = await liveEditorPostMessage?.send<{ fieldData: unknown }>(
        LiveEditorPostMessageEvents.GET_FIELD_DATA,
        { fieldMetadata }
    );

    return toString(data?.fieldData);
}

