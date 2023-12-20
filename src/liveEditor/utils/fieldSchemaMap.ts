import { has, isEqual } from "lodash";
import {
    ISchemaFieldMap,
    ISchemaIndividualFieldMap,
} from "./types/index.types";

import liveEditorPostMessage from "./liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "./types/postMessage.types";

/**
 * Represents a cache for field schemas. Field schemas are
 * used to easily get the field schema based on the field
 * Cslp.
 */
export class FieldSchemaMap {
    private static fieldSchema: {
        [contentTypeUid: string]: ISchemaIndividualFieldMap;
    } = {};

    /**
     * Retrieves the schema field map for a given content type and field Cslp.
     * @param contentTypeUid - The unique identifier of the content type.
     * @param fieldCslp - The Cslp of the field.
     * @returns The schema field map.
     */
    static async getFieldSchema(
        contentTypeUid: string,
        fieldCslp: string
    ): Promise<ISchemaFieldMap> {
        if (FieldSchemaMap.hasFieldSchema(contentTypeUid, fieldCslp)) {
            return Promise.resolve(
                FieldSchemaMap.fieldSchema[contentTypeUid][fieldCslp]
            );
        }

        const data = await liveEditorPostMessage?.send<{
            fieldSchemaMap: ISchemaIndividualFieldMap;
        }>(LiveEditorPostMessageEvents.GET_FIELD_SCHEMA, {
            contentTypeUid: contentTypeUid,
        });

        if (data?.fieldSchemaMap) {
            FieldSchemaMap.fieldSchema[contentTypeUid] = data.fieldSchemaMap;
        }

        return FieldSchemaMap.fieldSchema[contentTypeUid][fieldCslp];
    }

    static hasFieldSchema(contentTypeUid: string, fieldCslp: string): boolean {
        return has(FieldSchemaMap.fieldSchema, [contentTypeUid, fieldCslp]);
    }

    /**
     * Checks if two field schemas are equal.
     * @param firstFieldSchema - The first field schema to compare.
     * @param secondFieldSchema - The second field schema to compare.
     * @returns True if the field schemas are equal, false otherwise.
     */
    static areFieldSchemaEqual(
        firstFieldSchema: ISchemaFieldMap,
        secondFieldSchema: ISchemaFieldMap
    ): boolean {
        return isEqual(firstFieldSchema, secondFieldSchema);
    }

    /**
     * Sets the field schema for a given content type.
     * @param contentTypeUid The unique identifier of the content type.
     * @param fieldSchemaMap The map of individual field schemas.
     */
    static setFieldSchema(
        contentTypeUid: string,
        fieldSchemaMap: ISchemaIndividualFieldMap
    ): void {
        FieldSchemaMap.fieldSchema[contentTypeUid] = fieldSchemaMap;
    }

    /**
     * Clears the field schema cache.
     */
    static clear(): void {
        FieldSchemaMap.fieldSchema = {};
    }
}
