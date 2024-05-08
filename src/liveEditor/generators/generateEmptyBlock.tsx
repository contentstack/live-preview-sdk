import { hydrate } from "preact";
import { EmptyBlock } from "../components/emptyBlock";
import { extractDetailsFromCslp } from "../../cslp";


export function generateEmptyBlocks(
    emptyBlockParents: Element[] | []
): void {

  emptyBlockParents?.forEach((emptyBlockParent) => {

    const cslpData = emptyBlockParent.getAttribute("data-cslp");
    if (!cslpData) {
      return;
    }
    const fieldMetadata = extractDetailsFromCslp(cslpData);

    hydrate(<EmptyBlock details={{
      editableElement: emptyBlockParent,
      cslpData,
      fieldMetadata
    }}/>, emptyBlockParent);
  });
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