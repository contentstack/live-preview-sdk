import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import Config from "../../configManager/configManager";
import { removeAllCollabIcons } from "../generators/generateThread";
import { generateThreadsFromData } from "../generators/generateThread";

const handleRemoveCommentIcons = (): void => {
    removeAllCollabIcons();
};

export const useCollab = () => {
    const config = Config.get();

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_ENABLE,
        (data: any) => {
            if (!data?.data?.collab) {
                console.error("Invalid collab data structure:", data);
                return;
            }
            Config.set("collab.enable", data.data.collab.enable ?? false);
            Config.set("collab.state", data.data.collab.state ?? false);
            generateThreadsFromData(data.data.payload, true);
        }
    );

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_DISABLE,
        (data: any) => {
            Config.set("collab.enable", false);
            Config.set("collab.state", false);

            handleRemoveCommentIcons();
        }
    );
};

// export interface IHighlightComments {
//     payload: IHighlightCommentData[]; // Array of paths where comments exist
// }

// export interface IHighlightCommentsEvent {
//     data: IHighlightComments;
// }

// const handleAddCommentIcons = (event: IHighlightCommentsEvent) => {
//     const { payload } = event.data; // Get the array of path and its data
//     highlightCommentIconOnCanvas(payload);
// };

// export const useHighlightCommentIcon = () => {
//     visualBuilderPostMessage?.on(
//         VisualBuilderPostMessageEvents.HIGHLIGHT_ACTIVE_COMMENTS,
//         handleAddCommentIcons
//     );
//     visualBuilderPostMessage?.on(
//         VisualBuilderPostMessageEvents.REMOVE_HIGHLIGHTED_COMMENTS,
//         handleRemoveCommentIcons
//     );
// };
