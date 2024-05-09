import { CslpData } from "../../cslp/types/cslp.types";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { ISchemaFieldMap } from "../utils/types/index.types";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface EmptyBlockProps {
  details: {
    fieldMetadata: CslpData;
    fieldSchema: ISchemaFieldMap;
  }
}

export function EmptyBlock(props: EmptyBlockProps) {
  
  const { details } = props
  
  const blockParentName = details.fieldSchema.display_name;

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
        There are no {blockParentName.toLowerCase()} to show in this section.
      </div>
      <button className={'visual-editor__empty-block-add-button'} onClick={() => sendAddInstanceEvent()}>
        <i className="fas fa-plus"></i> &nbsp;
        {blockParentName}
      </button>
    </div>);
}