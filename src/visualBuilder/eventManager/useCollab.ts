import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import Config from "../../configManager/configManager";
import {
    removeAllCollabIcons,
    hideAllCollabIcons,
    removeCollabIcon,
    HighlightThread,
    showAllCollabIcons,
} from "../generators/generateThread";
import {
    generateThread,
    handleMissingThreads,
} from "../generators/generateThread";
import { IThreadDTO } from "../types/collab.types";

const handleRemoveCommentIcons = (fromShare: boolean = false): void => {
    if (fromShare) {
        hideAllCollabIcons();
        return;
    }
    removeAllCollabIcons();
};

export const useCollab = () => {
    const collabEnable = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_ENABLE,
        (data: any) => {
            if (data?.data?.collab?.fromShare) {
                Config.set(
                    "collab.pauseFeedback",
                    data?.data?.collab?.pauseFeedback
                );
                showAllCollabIcons();
                return;
            }

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

            const missingThreadIds = data?.data?.payload
                ?.map((payload: IThreadDTO) =>
                    generateThread(payload, { isNewThread: false })
                )
                .filter(Boolean);
            if (missingThreadIds.length > 0) {
                handleMissingThreads({
                    payload: { isElementPresent: false },
                    threadUids: missingThreadIds,
                });
            }
        }
    );

    const collabDisable = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_DISABLE,
        (data: any) => {
            if (data?.data?.collab?.fromShare) {
                Config.set(
                    "collab.pauseFeedback",
                    data?.data?.collab?.pauseFeedback
                );
                handleRemoveCommentIcons(true);
                return;
            }

            Config.set("collab.enable", false);
            Config.set("collab.isFeedbackMode", false);

            handleRemoveCommentIcons();
        }
    );

    const collabThreadRemove = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_REMOVE,
        (data: any) => {
            const { threadUid } = data.data;
            removeCollabIcon(threadUid);
        }
    );

    const collabThreadReopen = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN,
        (data: any) => {
            const thread = data.data.thread;
            const result = generateThread(thread, { isNewThread: false });
            if (result) {
                handleMissingThreads({
                    payload: { isElementPresent: false },
                    threadUids: [result],
                });
            }
        }
    );

    const collabThreadHighlight = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_HIGHLIGHT,
        (data: any) => {
            const { threadUid } = data.data;
            HighlightThread(threadUid);
        }
    );

    return () => {
        collabEnable?.unregister();
        collabDisable?.unregister();
        collabThreadRemove?.unregister();
        collabThreadReopen?.unregister();
        collabThreadHighlight?.unregister();
    };
};
