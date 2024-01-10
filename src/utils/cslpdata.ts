import _ from "lodash";
import {
    CslpData,
    CslpDataMultipleFieldMetadata,
    CslpDataParentDetails,
} from "../types/cslp.types";
import Config from "./configHandler";

/**
 * Extracts details from a CSLP value string.
 * @param cslpValue The CSLP value string to extract details from.
 * @returns An object containing the extracted details.
 */
export function extractDetailsFromCslp(cslpValue: string): CslpData {
    const [content_type_uid, entry_uid, locale, ...fieldPath] =
        cslpValue.split(".");

    const calculatedPath = fieldPath.filter((path) => {
        const isEmpty = _.isNil(path);
        const isNumber = _.isFinite(+path);
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
    if (_.isFinite(+fieldPath[fieldPath.length - 1])) {
        fieldPath.pop();
    }

    return {
        entry_uid,
        content_type_uid,
        locale,
        cslpValue: cslpValue,
        fieldPath: calculatedPath.join("."),
        fieldPathWithIndex: fieldPath.join("."),
        multipleFieldMetadata: multipleFieldMetadata,
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
    const index = _.findLastIndex(fieldPath, (path) => _.isFinite(+path));
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

    const index = _.findLast(fieldPath, (path) => _.isFinite(+path));

    return {
        parentDetails: parentDetails,
        index: _.isNil(index) ? -1 : +index,
    };
}

export function addCslpOutline(
    e: MouseEvent,
    callback?: (args: {
        cslpTag: string;
        highlightedElement: HTMLElement;
    }) => void
): void {
    const config = Config.get();

    let trigger = true;
    const eventTargets = e.composedPath();

    for (const eventTarget of eventTargets) {
        const element = eventTarget as HTMLElement;
        if (element.nodeName === "BODY") break;
        if (typeof element?.getAttribute !== "function") continue;

        const cslpTag = element.getAttribute("data-cslp");

        if (trigger && cslpTag) {
            if (config.elements.highlightedElement)
                config.elements.highlightedElement.classList.remove(
                    "cslp-edit-mode"
                );
            element.classList.add("cslp-edit-mode");

            const updatedElements = config.elements;
            updatedElements.highlightedElement = element;
            Config.set("elements", updatedElements);

            callback?.({
                cslpTag: cslpTag,
                highlightedElement: element,
            });

            trigger = false;
        } else if (!trigger) {
            element.classList.remove("cslp-edit-mode");
        }
    }
}
