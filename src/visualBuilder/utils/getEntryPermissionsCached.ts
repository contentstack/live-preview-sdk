import { getEntryPermissions } from "./getEntryPermissions";
import { createCachedFetch } from "./createCachedFetch";

console.log("Loading module: getEntryPermissionsCached [original]");
export const getEntryPermissionsCached = createCachedFetch(
    getEntryPermissions,
    ({ entryUid, contentTypeUid, locale }) =>
        `${entryUid}.${contentTypeUid}.${locale}`
);
