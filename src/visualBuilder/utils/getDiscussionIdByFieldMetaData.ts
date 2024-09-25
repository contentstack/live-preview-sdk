import { CslpData } from "../../cslp/types/cslp.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";
import { ISchemaFieldMap } from "./types/index.types";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import { IActiveDiscussion } from "../components/CommentIcon";

// Define an interface for the argument structure
interface GetDiscussionIdParams {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
}

/**
 * Retrieves the discussion data based on the field metadata and field UID.
 *
 * @param params The parameters including field metadata and field UID.
 * @returns A promise that resolves to the discussion data as a string.
 */
export async function getDiscussionIdByFieldMetaData(
    params: GetDiscussionIdParams
): Promise<IActiveDiscussion | null> {
    const { fieldMetadata, fieldSchema } = params;

    // Send a message to get the discussion Data
    const discussion =
        (await visualBuilderPostMessage?.send<IActiveDiscussion | null>(
            VisualBuilderPostMessageEvents.GET_DISCUSSION_ID,
            { fieldMetadata, fieldSchema }
        )) ?? null;

    return discussion;
}
