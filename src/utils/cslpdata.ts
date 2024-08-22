export interface CslpData {
    entry_uid: string;
    content_type_uid: string;
    variant?: string;
    cslpValue: string;
    locale: string;
    fieldPath: string;
}
/**
 * Extracts details from a CSLP value string.
 * @param cslpValue The CSLP value string to extract details from.
 * @returns An object containing the extracted details.
 */
export function extractDetailsFromCslp(cslpValue: string): CslpData {
    let [cslpVersion, cslpData] = cslpValue.split(":");
    // If the cslpVersion is greater than 2 letter which means it is v1 version of cslp data
    if (cslpVersion.length > 2) {
        cslpData = cslpVersion;
        cslpVersion = "v1";
    }
    return destructureCslpValue(cslpData, cslpVersion);
}

function destructureCslpValue(cslpData: string, version: string): CslpData {
    const [content_type_uid, entryInfo, locale, ...fieldPath] =
        cslpData.split(".");
    switch (version) {
        case "v2": {
            const [entry_uid, variant] = entryInfo.split("_");
            return {
                entry_uid,
                content_type_uid,
                variant,
                locale,
                cslpValue: cslpData,
                fieldPath: fieldPath.join("."),
            };
        }
        default:
            return {
                entry_uid: entryInfo,
                content_type_uid,
                locale,
                cslpValue: cslpData,
                fieldPath: fieldPath.join("."),
            };
    }
}
