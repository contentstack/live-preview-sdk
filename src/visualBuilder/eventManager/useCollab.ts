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
import {
    IThreadDTO,
    ICollabConfig,
    IThreadIdentifier,
    IThreadRemove,
    IThreadReopen,
} from "../types/collab.types";
import { OnEvent } from "@contentstack/advanced-post-message";

const handleRemoveCommentIcons = (fromShare: boolean = false): void => {
    if (fromShare) {
        hideAllCollabIcons();
        return;
    }
    removeAllCollabIcons();
};

export const useCollab = () => {
    const config = Config.get();
    const collabEnable = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_ENABLE,
        (data: OnEvent<ICollabConfig>) => {
            if (!data?.data?.collab) {
                console.error("Invalid collab data structure:", data);
                return;
            }
            if (data?.data?.collab?.fromShare) {
                Config.set(
                    "collab.pauseFeedback",
                    data?.data?.collab?.pauseFeedback
                );
                Config.set(
                    "collab.isFeedbackMode",
                    data?.data?.collab?.isFeedbackMode
                );
                showAllCollabIcons();
                return;
            }

            Config.set("collab.enable", data.data.collab.enable ?? false);
            Config.set(
                "collab.isFeedbackMode",
                data.data.collab.isFeedbackMode ?? false
            );
            Config.set(
                "collab.pauseFeedback",
                data?.data?.collab?.pauseFeedback
            );
            Config.set(
                "collab.inviteMetadata",
                data.data.collab.inviteMetadata
            );
        }
    );

    const collabPayload = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_DATA_UPDATE,
        (data: OnEvent<ICollabConfig>) => {
            if (!config?.collab?.enable) return;

            if (!data?.data?.collab) {
                console.error("Invalid collab data structure:", data);
                return;
            }

            if (data?.data?.collab?.inviteMetadata) {
                Config.set(
                    "collab.inviteMetadata",
                    data?.data?.collab?.inviteMetadata
                );
                return;
            }

            const missingThreadIds =
                data?.data?.collab?.payload
                    ?.map((payload: IThreadDTO) => generateThread(payload))
                    .filter((id): id is string => id !== undefined) || [];
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
        (data: OnEvent<ICollabConfig>) => {
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
        VisualBuilderPostMessageEvents.COLLAB_THREADS_REMOVE,
        (data: OnEvent<IThreadRemove>) => {
            const threadUids = data?.data?.threadUids;

            if (!config?.collab?.enable) return;

            if (data?.data?.updateConfig) {
                Config.set("collab.isFeedbackMode", true);
            }
            if (threadUids.length > 0) {
                threadUids.forEach((threadUid) => {
                    removeCollabIcon(threadUid);
                });
            }
        }
    );

    const collabThreadReopen = visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.COLLAB_THREAD_REOPEN,
        (data: OnEvent<IThreadReopen>) => {
            const thread = data.data.thread;

            if (!config?.collab?.enable) return;

            const result = generateThread(thread, {
                hidden: Boolean(config?.collab?.pauseFeedback),
            });
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
        (data: OnEvent<IThreadIdentifier>) => {
            const { threadUid } = data.data;
            if (!config?.collab?.enable || config?.collab?.pauseFeedback)
                return;

            HighlightThread(threadUid);
        }
    );

    return () => {
        collabEnable?.unregister();
        collabPayload?.unregister();
        collabDisable?.unregister();
        collabThreadRemove?.unregister();
        collabThreadReopen?.unregister();
        collabThreadHighlight?.unregister();
    };
};
