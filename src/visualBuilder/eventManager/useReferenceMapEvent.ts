import { ReferenceMapPostMessageEventData, VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

export function useReferenceMapEvents(): void {
  visualBuilderPostMessage?.on<ReferenceMapPostMessageEventData>(
      VisualBuilderPostMessageEvents.REFERENCE_MAP,
      (event) => {
          console.log("REFERENCE_MAP", event.data);
      }
  );
}