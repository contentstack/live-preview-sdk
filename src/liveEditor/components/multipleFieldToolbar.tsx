import { useSignal } from "@preact/signals";
import getChildrenDirection from "../utils/getChildrenDirection";
import { CslpData } from "../../cslp/types/cslp.types";

import { MoveLeftIcon, MoveRightIcon, DeleteIcon } from "./icons";
import {
    handleDeleteInstance,
    handleMoveInstance,
} from "../utils/instanceHandlers";

interface MultipleFieldToolbarProps {
    fieldMetadata: CslpData;
    targetElement: Element;
}

function MultipleFieldToolbarComponent(
    props: MultipleFieldToolbarProps
): JSX.Element {
    const direction = useSignal("");
    const parentPath =
        props.fieldMetadata?.multipleFieldMetadata?.parentDetails
            ?.parentCslpValue || "";

    direction.value = getChildrenDirection(props.targetElement, parentPath);

    return (
        <div
            className="visual-editor__focused-toolbar__multiple-field-toolbar"
            data-testid="visual-editor__focused-toolbar__multiple-field-toolbar"
        >
            <div className="visual-editor__focused-toolbar__button-group">
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
                        handleMoveInstance(props.fieldMetadata, "previous");
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
            </div>
        </div>
    );
}

export default MultipleFieldToolbarComponent;
