import { getEntryPermissions } from "./getEntryPermissions";
import { createCachedFetch } from "./createCachedFetch";

export const getEntryPermissionsCached = createCachedFetch(
    getEntryPermissions,
    ({ entryUid, contentTypeUid, locale }) =>
        `${entryUid}.${contentTypeUid}.${locale}`
);
