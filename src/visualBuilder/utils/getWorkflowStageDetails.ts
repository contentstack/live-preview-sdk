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
        requestEditAccess: {
            canRequest: false,
            hasPending: false,
        },
    };
}

/** Mirrors visual-editor GET_WORKFLOW_STAGE_DETAILS payload (QuickForm / canvas alignment). */
export interface WorkflowStageRequestEditAccess {
    canRequest: boolean;
    hasPending: boolean;
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
    /** Present when returned by visual-editor; omitted in legacy SDK-only fallbacks. */
    requestEditAccess?: WorkflowStageRequestEditAccess;
}
