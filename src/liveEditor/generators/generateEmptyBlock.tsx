import { hydrate } from "preact";
import { EmptyBlock } from "../components/emptyBlock";
import { extractDetailsFromCslp } from "../../cslp";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";


export async function generateEmptyBlocks(
    emptyBlockParents: Element[] | []
): Promise<void> {

  for (const emptyBlockParent of emptyBlockParents) {

    const cslpData = emptyBlockParent.getAttribute("data-cslp");
    if (!cslpData) {
      return;
    }
    const fieldMetadata = extractDetailsFromCslp(cslpData);

    const fieldSchema = await FieldSchemaMap.getFieldSchema(
      fieldMetadata.content_type_uid,
      fieldMetadata.fieldPath
    );

    hydrate(<EmptyBlock details={{
      fieldSchema,
      fieldMetadata
    }}/>, emptyBlockParent);

  }
}

export function removeEmptyBlocks(
  emptyBlockParents: Element[] | []
): void {
  emptyBlockParents?.forEach((emptyBlockParent) => {

    const emptyBlock = emptyBlockParent.querySelector(".visual-editor__empty-block");

    if (emptyBlock) {
      emptyBlock.remove();
    }
  })
}