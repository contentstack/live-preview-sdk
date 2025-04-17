import visualBuilderPostMessage from "./visualBuilderPostMessage";

export interface EntryPermissions {
    create: boolean;
    read: boolean;
    update: boolean;
    delete: boolean;
    publish: boolean;
}

export async function getEntryPermissions({
    entryUid,
    contentTypeUid,
    locale,
}: {
    entryUid: string;
    contentTypeUid: string;
    locale: string;
}) {
    try {
        const permissions =
            await visualBuilderPostMessage?.send<EntryPermissions>(
                "get-permissions",
                {
                    type: "entry",
                    entryUid,
                    contentTypeUid,
                    locale,
                }
            );
        if (permissions) {
            return permissions;
        }
    } catch (error) {
        console.debug("[Visual Builder] Error fetching permissions", error);
    }
    // allow editing when things go wrong,
    // e.g. when no permissions are received
    return {
        create: true,
        read: true,
        update: true,
        delete: true,
        publish: true,
    };
}
