import { CslpData } from "../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface EmptyBlockProps {
  details: {
    editableElement: Element;
    cslpData: string;
    fieldMetadata: CslpData;
  }
}

export function EmptyBlock(props: EmptyBlockProps) {

  const { details } = props
  
  const blockParentName = details.fieldMetadata.fieldPath.split('.').at(-1)!.split('_').join(' ')
  const capitalizedBlockParentName = blockParentName.replace(/\b[a-z]/g, (letter: string) => {
    return letter.toUpperCase();
  });

  function sendAddInstanceEvent() {
    liveEditorPostMessage?.send(
      LiveEditorPostMessageEvents.ADD_INSTANCE,
      {
          fieldMetadata: details.fieldMetadata,
          index: 0,
      }
    );
  }

  return (
    <div className="visual-editor__empty-block">
      <div className="visual-editor__empty-block-title">
        There are no {blockParentName} to show in this section.
      </div>
      <button className={'visual-editor__empty-block-add-button'} onClick={() => sendAddInstanceEvent()}>
        <i className="fas fa-plus"></i> &nbsp;
        {capitalizedBlockParentName}
      </button>
    </div>);
}