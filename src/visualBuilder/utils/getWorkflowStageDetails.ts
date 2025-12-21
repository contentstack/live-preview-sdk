import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";

export async function getWorkflowStageDetails({
    entryUid,
    contentTypeUid,
    locale,
    variantUid,
}: {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
    variantUid?: string | undefined;
}): Promise<WorkflowStageDetails> {
    try {
        const result =
            await visualBuilderPostMessage?.send<WorkflowStageDetails>(
                VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS,
                {
                    entryUid,
                    contentTypeUid,
                    locale,
                    variantUid,
                }
            );
        if (result) {
            return result;
        }
    } catch (e) {
        console.debug(
            "[Visual Builder] Error fetching workflow stage details",
            e
        );
    }
    // allow editing when things go wrong,
    return {
        stage: {
            name: "Unknown",
        },
        permissions: {
            entry: {
                update: true,
            },
        },
    };
}

export interface WorkflowStageDetails {
    stage:
        | {
              name: string;
          }
        | undefined;
    permissions: {
        entry: {
            update: boolean;
        };
    };
}
