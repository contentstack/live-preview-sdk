import { toString } from "lodash-es";
import liveEditorPostMessage from "./visualBuilderPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

/**
 * Retrieves the actual fieldPath along with the fieldUid
 *
 * @param fieldMetadata The metadata of the field.
 * @param path The cslp path of the field.
 * @returns A promise that resolves to the expected fieldPath with uid as a string.
 */
export async function getFieldPathWithUid(path: string): Promise<string> {
    const data = await liveEditorPostMessage?.send<{
        fieldPathWithUid: unknown;
    }>(LiveEditorPostMessageEvents.GET_FIELD_PATH_WITH_UID, { path });

    return toString(data?.fieldPathWithUid);
}
