import { getEntryPermissionsCached } from "./getEntryPermissionsCached";
import { getWorkflowStageDetails } from "./getWorkflowStageDetails";

export async function fetchEntryPermissionsAndStageDetails({
    entryUid,
    contentTypeUid,
    locale,
    variantUid,
}: {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
    variantUid?: string | undefined;
}) {
    const entryAclPromise = getEntryPermissionsCached({
        entryUid,
        contentTypeUid,
        locale,
    });
    const entryWorkflowStageDetailsPromise = getWorkflowStageDetails({
        entryUid,
        contentTypeUid,
        locale,
        variantUid,
    });
    const results = await Promise.allSettled([
        entryAclPromise,
        entryWorkflowStageDetailsPromise,
    ]);
    if (results[0].status === "rejected") {
        console.debug(
            "[Visual Builder] Error retrieving entry permissions",
            results[0].reason
        );
    }
    if (results[1].status === "rejected") {
        console.debug(
            "[Visual Builder] Error retrieving entry stage details",
            results[1].reason
        );
    }
    const acl =
        results[0].status === "fulfilled" ? results[0].value : undefined;
    const workflowStage =
        results[1].status === "fulfilled" ? results[1].value : undefined;
    return {
        acl,
        workflowStage,
    };
}
