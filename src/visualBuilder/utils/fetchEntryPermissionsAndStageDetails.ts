import { getEntryPermissionsCached } from "./getEntryPermissionsCached";
import { getResolvedVariantPermissions } from "./getResolvedVariantPermissions";
import { getWorkflowStageDetails } from "./getWorkflowStageDetails";
import { requestEntryLockInfoOnce } from "./fieldLockIndicator";

export async function fetchEntryPermissionsAndStageDetails({
    entryUid,
    contentTypeUid,
    locale,
    variantUid,
    fieldPathWithIndex,
}: {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
    fieldPathWithIndex: string;
    variantUid?: string | undefined;
}) {
    // Fire-and-forget: pull this entry's lock snapshot once and paint indicators.
    // De-duped per entry (the parent pushes deltas afterwards), so hovering does
    // not spam requests, and it must not block the permission/stage fetch below.
    void requestEntryLockInfoOnce({
        entryUid,
        contentTypeUid,
        locale,
        ...(variantUid ? { variantUid } : {}),
    });

    const entryAclPromise = getEntryPermissionsCached({
        entryUid,
        contentTypeUid,
        locale,
    });
    const resolvedVariantPermissionsPromise = getResolvedVariantPermissions({
        entry_uid: entryUid,
        content_type_uid: contentTypeUid,
        locale,
        variant: variantUid,
        fieldPathWithIndex,
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
        resolvedVariantPermissionsPromise
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
    if (results[2].status === "rejected") {
        console.debug(
            "[Visual Builder] Error retrieving resolved variant permissions",
            results[2].reason
        );
    }
    const acl =
        results[0].status === "fulfilled" ? results[0].value : undefined;
    const workflowStage =
        results[1].status === "fulfilled" ? results[1].value : undefined;
    const resolvedVariantPermissions =
        results[2].status === "fulfilled" ? results[2].value : undefined;
    return {
        acl,
        workflowStage,
        resolvedVariantPermissions,
    };
}
