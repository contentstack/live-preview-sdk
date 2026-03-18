import { hydrate } from "preact";
import React from "preact/compat";
import { EmptyBlock } from "../components/emptyBlock";
import { extractDetailsFromCslp, isValidCslp } from "../../cslp";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";

export async function generateEmptyBlocks(
    emptyBlockParents: Element[] | []
): Promise<void> {
    for (const emptyBlockParent of emptyBlockParents) {
        const cslpData = emptyBlockParent.getAttribute("data-cslp");
        if (!isValidCslp(cslpData)) {
            return;
        }
        const fieldMetadata = extractDetailsFromCslp(cslpData);

        const fieldSchema = await FieldSchemaMap.getFieldSchema(
            fieldMetadata.content_type_uid,
            fieldMetadata.fieldPath
        );
        
        if(!fieldSchema){
            return;
        }

        hydrate(
            <EmptyBlock
                details={{
                    fieldSchema,
                    fieldMetadata,
                }}
            />,
            emptyBlockParent
        );
    }
}

export function removeEmptyBlocks(emptyBlockParents: Element[] | []): void {
    emptyBlockParents?.forEach((emptyBlockParent) => {
        const emptyBlock = emptyBlockParent.querySelector(
            ".visual-builder__empty-block"
        );

        if (emptyBlock) {
            emptyBlock.remove();
        }
    });
}
