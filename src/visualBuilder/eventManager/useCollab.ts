import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import Config from "../../configManager/configManager";
import {
    removeAllCollabIcons,
    removeCollabIcon,
} from "../generators/generateThread";
import {
    generateThreadsFromData,
    generateThreadFromData,
} from "../generators/generateThread";

const handleRemoveCommentIcons = (): void => {
    removeAllCollabIcons();
};

export const useCollab = () => {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_ENABLE,
        (data: any) => {
            if (!data?.data?.collab) {
                console.error("Invalid collab data structure:", data);
                return;
            }
            Config.set("collab.enable", data.data.collab.enable ?? false);
            Config.set(
                "collab.isFeedbackMode",
                data.data.collab.isFeedbackMode ?? false
            );
            Config.set(
                "collab.inviteMetadata",
                data.data.collab.inviteMetadata
            );
            generateThreadsFromData(data.data.payload);
        }
    );

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_DISABLE,
        (data: any) => {
            Config.set("collab.enable", false);
            Config.set("collab.isFeedbackMode", false);

            handleRemoveCommentIcons();
        }
    );

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_REMOVE,
        (data: any) => {
            const { threadUid } = data.data;
            removeCollabIcon(threadUid);
        }
    );

    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN,
        (data: any) => {
            const thread = data.data.thread;
            generateThreadFromData(thread);
        }
    );
};
