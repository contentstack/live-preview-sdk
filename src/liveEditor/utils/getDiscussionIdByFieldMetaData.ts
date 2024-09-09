import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "./liveEditorPostMessage";
import { ISchemaFieldMap } from "./types/index.types";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

// Define an interface for the argument structure
interface GetDiscussionIdParams {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
}

/**
 * Retrieves the discussion ID based on the field metadata and field UID.
 *
 * @param params The parameters including field metadata and field UID.
 * @returns A promise that resolves to the discussion ID as a string.
 */
export async function getDiscussionIdByFieldMetaData(
    params: GetDiscussionIdParams
): Promise<string> {
    const { fieldMetadata, fieldSchema } = params;

    // Send a message to get the discussion ID
    const discussionUID =
        (await liveEditorPostMessage?.send<string>(
            LiveEditorPostMessageEvents.GET_DISCUSSION_ID,
            { fieldMetadata, fieldSchema }
        )) ?? "new";

    return discussionUID;
}
