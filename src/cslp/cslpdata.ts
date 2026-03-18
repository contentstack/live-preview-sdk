import { isNil, isFinite, findLastIndex, findLast } from "lodash-es";
import {
    CslpData,
    CslpDataMultipleFieldMetadata,
    CslpDataParentDetails,
} from "./types/cslp.types";
import Config from "../configManager/configManager";
import { DeepSignal } from "deepsignal";
import { cslpTagStyles } from "../livePreview/editButton/editButton.style";

/**
 * Validates that the required CSLP parts (content_type_uid, entry_uid/entry_uid_variant_uid, locale) are non-empty.
 * @param parts The array of parts from splitting the CSLP string by "."
 * @returns `true` if all required parts (first 3) are non-empty, `false` otherwise.
 */
function areRequiredPartsNonEmpty(parts: string[]): boolean {
    // Check that we have at least 3 parts
    if (parts.length < 3) {
        return false;
    }
    // Verify that content_type_uid (parts[0]), entry_uid/entry_uid_variant_uid (parts[1]), and locale (parts[2]) are all non-empty
    return parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0;
}

/**
 * Validates if a CSLP value string is valid.
 * 
 * Supports two formats:
 * - **v1 format**: `content_type_uid.entry_uid.locale[.field_path]` (requires at least 3 parts)
 * - **v2 format**: `v2:content_type_uid.entry_uid_variant_uid.locale[.field_path]` 
 *   (requires at least 3 parts, entry_uid_variant_uid must contain underscore separating entry_uid and variant_uid)
 * 
 * @param cslpValue The CSLP value string to validate (can be null or undefined).
 * @returns Type predicate: `true` if the CSLP value is valid (narrows type to `string`), `false` otherwise.
 * 
 * @example
 * Valid v1 format
 * isValidCslp("page.entry123.en-us") -> true
 * isValidCslp("page.entry123.en-us.title") -> true
 * 
 * Valid v2 format
 * isValidCslp("v2:page.entry123_variant456.en-us") -> true
 * isValidCslp("v2:page.entry123_variant456.en-us.title") -> true
 * 
 * Invalid cases
 * isValidCslp(null) -> false
 * isValidCslp("invalid") -> false (less than 3 parts)
 * isValidCslp("v2:page.entry123.en-us") -> false (missing underscore in entry_uid_variant_uid)
 */
export function isValidCslp(
    cslpValue: string | null | undefined
): cslpValue is string {
    // Return false for null, undefined, or empty string
    if (!cslpValue) {
        return false;
    }

    // Check for v2 format (starts with "v2:")
    if (cslpValue.startsWith("v2:")) {
        const dataAfterPrefix = cslpValue.substring(3); // Remove "v2:" prefix
        const parts = dataAfterPrefix.split(".");
        // v2 format requires at least 3 parts: content_type_uid.entry_uid_variant_uid.locale
        // Verify that content_type_uid, entry_uid_variant_uid, and locale are all non-empty
        if (!areRequiredPartsNonEmpty(parts)) {
            return false;
        }
        // Verify that entry_uid_variant_uid (second part) contains both entry_uid and variant_uid separated by at least one underscore
        const entryUidVariantUid = parts[1];
        const entryVariantParts = entryUidVariantUid.split("_");
        // Check that we have at least 2 parts (entry_uid and variant_uid) and all parts are non-empty
        return entryVariantParts.length >= 2 && entryVariantParts.every((part) => part.length > 0);
    }

    // v1 format (default, no prefix)
    const parts = cslpValue.split(".");
    // v1 format requires at least 3 parts: content_type_uid.entry_uid.locale
    // Verify that content_type_uid, entry_uid, and locale are all non-empty
    return areRequiredPartsNonEmpty(parts);
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

    const [content_type_uid, entryInfo, locale, ...fieldPath] =
        cslpData.split(".");

    let entry_uid: string;
    let variant;

    switch (cslpVersion) {
        case "v2": {
            const [uid, variant_uid] = entryInfo.split("_");
            entry_uid = uid;
            variant = variant_uid;
            break;
        }
        default: {
            entry_uid = entryInfo;
            break;
        }
    }
    const instancePathWithInstance = fieldPath.join(".");
    const calculatedPath = fieldPath.filter((path) => {
        const isEmpty = isNil(path);
        const isNumber = isFinite(+path);
        return (!isEmpty && !isNumber) || false;
    });

    const multipleFieldMetadata: CslpDataMultipleFieldMetadata =
        getMultipleFieldMetadata(
            content_type_uid,
            entry_uid,
            locale,
            fieldPath
        );

    /**
     * The index in the end of the field does not represent a field.
     * It represents the index of the field in the multiple field.
     * Hence, we pop it out.
     */
    if (isFinite(+fieldPath[fieldPath.length - 1])) {
        fieldPath.pop();
    }

    return {
        entry_uid,
        content_type_uid,
        variant,
        locale,
        cslpValue: cslpValue,
        fieldPath: calculatedPath.join("."),
        fieldPathWithIndex: fieldPath.join("."),
        multipleFieldMetadata: multipleFieldMetadata,
        instance: {
            fieldPathWithIndex: instancePathWithInstance,
        },
    };
}

/**
 * Returns the parent path details of a given field path in CSLP format.
 * @param content_type_uid - The UID of the content type.
 * @param entry_uid - The UID of the entry.
 * @param locale - The locale of the entry.
 * @param fieldPath - The field path to get the parent path details for.
 * @returns The parent path details in CSLP format, or null if the field path does not have a parent.
 */
function getParentPathDetails(
    content_type_uid: string,
    entry_uid: string,
    locale: string,
    fieldPath: string[]
): CslpDataParentDetails | null {
    const index = findLastIndex(fieldPath, (path) => isFinite(+path));
    if (index === -1) return null;

    const parentPath = fieldPath.slice(0, index);
    return {
        parentPath: parentPath.join("."),
        parentCslpValue: [
            content_type_uid,
            entry_uid,
            locale,
            ...parentPath,
        ].join("."),
    };
}

/**
 * Returns metadata for a multiple field in a content entry.
 * @summary ONLY USE THESE RETURNED VALUES WHEN FIELD IS MULTIPLE
 * @summary IT GIVES WRONG DATA IF FIELD IS NOT MULTIPLE
 * @param content_type_uid - The UID of the content type.
 * @param entry_uid - The UID of the content entry.
 * @param locale - The locale of the content entry.
 * @param fieldPath - The path of the multiple field.
 * @returns The metadata for the multiple field.
 */
function getMultipleFieldMetadata(
    content_type_uid: string,
    entry_uid: string,
    locale: string,
    fieldPath: string[]
): CslpDataMultipleFieldMetadata {
    const parentDetails = getParentPathDetails(
        content_type_uid,
        entry_uid,
        locale,
        fieldPath
    );

    const index = findLast(fieldPath, (path) => isFinite(+path));

    return {
        parentDetails: parentDetails,
        index: isNil(index) ? -1 : +index,
    };
}

//TODO: move this to editbutton
/**
 * Adds an outline to the clicked element and triggers a callback function.
 * @param e - The MouseEvent object representing the click event.
 * @param callback - An optional callback function that will be called with the CSLP tag and highlighted element as arguments.
 */
export function addCslpOutline(
    e: MouseEvent,
    callback?: (args: {
        cslpTag: string;
        highlightedElement: HTMLElement;
    }) => void
): void {
    const elements = Config.get().elements;

    let trigger = true;
    const eventTargets = e.composedPath();

    for (const eventTarget of eventTargets) {
        const element = eventTarget as HTMLElement;
        if (element.nodeName === "BODY") break;
        if (typeof element?.getAttribute !== "function") continue;

        const cslpTag = element.getAttribute("data-cslp");

        if (trigger && isValidCslp(cslpTag)) {
            if (elements.highlightedElement)
                elements.highlightedElement.classList.remove(
                    cslpTagStyles()["cslp-edit-mode"]
                );
            element.classList.add(cslpTagStyles()["cslp-edit-mode"]);

            const updatedElements = elements;
            updatedElements.highlightedElement =
                element as DeepSignal<HTMLElement>;
            Config.set("elements", updatedElements);

            callback?.({
                cslpTag: cslpTag,
                highlightedElement: element,
            });

            trigger = false;
        } else if (!trigger) {
            element.classList.remove(cslpTagStyles()["cslp-edit-mode"]);
        }
    }
}
