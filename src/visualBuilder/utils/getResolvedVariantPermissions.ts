import { CslpData } from "../../cslp/types/cslp.types";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";
import visualBuilderPostMessage from "./visualBuilderPostMessage";

export type FieldContext = Pick<CslpData, "content_type_uid" | "entry_uid" | "locale" | "variant" | "fieldPathWithIndex">;

export interface ResolvedVariantPermissions {
  update: boolean;
}

export async function getResolvedVariantPermissions(fieldContext: FieldContext) {
  try {
    const result = await visualBuilderPostMessage?.send<ResolvedVariantPermissions>(VisualBuilderPostMessageEvents.GET_RESOLVED_VARIANT_PERMISSIONS, fieldContext);
    return result ?? {
      update: true,
    };
  }
  catch(e) {
    console.warn("Error retrieving resolved variant permissions", e);
    return {
      update: true,
    };
  }
}