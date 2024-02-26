import { useSignal } from "@preact/signals";
import liveEditorPostMessage from "./../utils/liveEditorPostMessage";
import { getChildrenDirection } from "./../utils/multipleElementAddButton";
import { LiveEditorPostMessageEvents } from "./../utils/types/postMessage.types";
import { CslpData } from "../../cslp/types/cslp.types";

import { MoveLeftIcon, MoveRightIcon, DeleteIcon } from "./icons";

interface MultipleFieldToolbarProps {
    fieldMetadata: CslpData;
    targetElement : Element;
}

function handleDeleteInstance(fieldMetadata: CslpData) {
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.DELETE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
}

function handleMoveInstance(
    fieldMetadata: CslpData,
    direction: "previous" | "next"
) {
    //TODO: Disable first and last instance move
    liveEditorPostMessage
        ?.send(LiveEditorPostMessageEvents.MOVE_INSTANCE, {
            data:
                fieldMetadata.fieldPathWithIndex +
                "." +
                fieldMetadata.multipleFieldMetadata.index,
            direction: direction,
            fieldMetadata: fieldMetadata,
        })
        .finally(closeOverlay);
}

function closeOverlay() {
    document
        .querySelector<HTMLDivElement>(".visual-editor__overlay--top")
        ?.click();
}



export function MultipleFieldToolbarComponent(props: MultipleFieldToolbarProps) {

    const direction = useSignal("");
    const parentPath =
    props.fieldMetadata?.multipleFieldMetadata?.parentDetails
        ?.parentCslpValue || "";

    direction.value = getChildrenDirection(
        props.targetElement,
        parentPath
    );
    
    return (
        <div className="visual-editor__focused-toolbar__multiple-field-toolbar">

            <div className="visual-editor__focused-toolbar__button-group">

                <button className={`visual-editor__button visual-editor__button--secondary ${direction.value === "vertical" ? "visual-editor__rotate--90" : ""}`} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMoveInstance(props.fieldMetadata, "previous");
                }}>
                    <MoveLeftIcon /> 
                </button>
                

                <button className={`visual-editor__button visual-editor__button--secondary ${direction.value === "vertical" ? "visual-editor__rotate--90" : ""}`} onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleMoveInstance(props.fieldMetadata, "next");
                }}>
                    <MoveRightIcon /> 
                </button>


                <button className="visual-editor__button visual-editor__button--secondary" onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDeleteInstance(props.fieldMetadata);
                }}>
                    <DeleteIcon /> 
                </button>

           </div>

        </div>
    )

}

export default MultipleFieldToolbarComponent;