import { useSignal } from "@preact/signals";
import getChildrenDirection from "../utils/getChildrenDirection";
import { CslpData } from "../../cslp/types/cslp.types";

import { MoveLeftIcon, MoveRightIcon, DeleteIcon } from "./icons";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../utils/instanceHandlers";
import { UrlIcon } from "./icons/url";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";
import { ALLOWED_MODAL_EDITABLE_FIELD } from "../utils/constants";

interface MultipleFieldToolbarProps {
    fieldMetadata: CslpData;
    fieldSchema: Record<string, any>;
    targetElement: Element;
    isMultiple: boolean;
    isDisabled: boolean;
}

function handleEdit(fieldMetadata: CslpData) {
    liveEditorPostMessage?.send(
        LiveEditorPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
        {
            data: fieldMetadata,
        }
    );
}

function FieldToolbarComponent(props: MultipleFieldToolbarProps): JSX.Element {
    const direction = useSignal("");
    const parentPath =
        props.fieldMetadata?.multipleFieldMetadata?.parentDetails
            ?.parentCslpValue || "";

    direction.value = getChildrenDirection(props.targetElement, parentPath);

    const isModalEditable = ALLOWED_MODAL_EDITABLE_FIELD.includes(
        props.fieldSchema?.data_type
    );

    // TODO use correct icons for different fields
    const editButton = (
        <button
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__edit-button"
            className="visual-editor__button visual-editor__button--secondary"
            onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit(props.fieldMetadata);
            }}
        >
            <UrlIcon />
        </button>
    );

    return (
        <div
            className="visual-editor__focused-toolbar__multiple-field-toolbar"
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar"
        >
            <div className="visual-editor__focused-toolbar__button-group">
                {props.isMultiple && !props.isDisabled ? (
                    <>
                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__move-left-button"
                            className={`visual-editor__button visual-editor__button--secondary ${
                                direction.value === "vertical"
                                    ? "visual-editor__rotate--90"
                                    : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveInstance(
                                    props.fieldMetadata,
                                    "previous"
                                );
                            }}
                        >
                            <MoveLeftIcon />
                        </button>

                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__move-right-button"
                            className={`visual-editor__button visual-editor__button--secondary ${
                                direction.value === "vertical"
                                    ? "visual-editor__rotate--90"
                                    : ""
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMoveInstance(props.fieldMetadata, "next");
                            }}
                        >
                            <MoveRightIcon />
                        </button>

                        {isModalEditable ? editButton : null}

                        <button
                            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar__delete-button"
                            className="visual-editor__button visual-editor__button--secondary"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteInstance(props.fieldMetadata);
                            }}
                        >
                            <DeleteIcon />
                        </button>
                    </>
                ) : (
                    <>{isModalEditable ? editButton : null}</>
                )}
            </div>
        </div>
    );
}

export default FieldToolbarComponent;
