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
    const permissions = await visualBuilderPostMessage?.send<EntryPermissions>(
        "get-permissions",
        {
            type: "entry",
            entryUid,
            contentTypeUid,
            locale,
        }
    );
    // allow editing when things go wrong,
    // e.g. when no permissions are received
    if (!permissions) {
        return {
            create: true,
            read: true,
            update: true,
            delete: true,
            publish: true,
        };
    }
    return permissions;
}
