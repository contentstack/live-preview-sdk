import _ from "lodash";
import { CslpData } from "../types/cslp.types";

export function extractDetailsFromCslp(cslpValue: string): CslpData {
    const [content_type_uid, entry_uid, locale, ...fieldPath] =
        cslpValue.split(".");

    const calculatedPath = fieldPath.filter((path) => {
        const isEmpty = _.isNil(path);
        const isNumber = _.isFinite(+path);
        return (!isEmpty && !isNumber) || false;
    });
    return {
        entry_uid,
        content_type_uid,
        locale,
        fieldPath: calculatedPath.join("."),
    };
}
