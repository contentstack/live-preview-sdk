import throttle from "lodash.throttle";
import { sendFieldEvent } from "../generators/generateOverlay";
import {
    ALLOWED_INLINE_EDITABLE_FIELD,
    VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY,
    numericInputRegex,
} from "./constants";
import { FieldDataType } from "./types/index.types";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";

export function handleFieldInput(e: Event): void {
    const event = e as InputEvent;
    const targetElement = event.target as HTMLElement;
    const fieldType = targetElement.getAttribute(
        VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
    ) as FieldDataType | null;
    if (event.type === "input" && ALLOWED_INLINE_EDITABLE_FIELD.includes(fieldType as FieldDataType)) {
        throttledFieldSync();
    }
}
const throttledFieldSync = throttle(() => {
    try {
        const visualBuilderContainer = document.querySelector(
            ".visual-builder__container"
        ) as HTMLElement;
        if(!visualBuilderContainer) return;
        sendFieldEvent({
            visualBuilderContainer,
            eventType: VisualBuilderPostMessageEvents.SYNC_FIELD,
        })  
    } catch (error) {
        console.error("Error in throttledFieldSync", error)
    }
}, 300);

export function handleFieldKeyDown(e: Event): void {
    const event = e as KeyboardEvent;
    const targetElement = event.target as HTMLElement;
    const fieldType = targetElement.getAttribute(
        VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
    ) as FieldDataType | null;

    if (fieldType === FieldDataType.NUMBER) {
        handleNumericFieldKeyDown(event);
    } else if (fieldType === FieldDataType.SINGLELINE) {
        handleSingleLineFieldKeyDown(event);
    }
}

function handleSingleLineFieldKeyDown(e: KeyboardEvent) {
    if (e.code === "Enter") {
        e.preventDefault();
    }
}

function handleNumericFieldKeyDown(event: KeyboardEvent): void {
    const targetElement = event.target as HTMLElement;

    const allowedKeys = [
        "Backspace",
        "Tab",
        "Enter",
        "End",
        "Home",
        "ArrowLeft",
        "ArrowRight",
        "Delete",
    ];

    if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        allowedKeys.includes(event.code)
    ) {
        // Allow Ctrl, Cmd, Alt, and special keys
        return;
    }

    if (event.code.includes("Digit")) {
        return;
    }

    const nonNumericAllowedCharacters = ["-", ".", "e", "E"];

    if (!nonNumericAllowedCharacters.includes(event.key)) {
        event.preventDefault();
        return;
    }

    const selection = {
        startOffset: window.getSelection()?.getRangeAt(0).startOffset || 0,
        endOffset: window.getSelection()?.getRangeAt(0).endOffset || 0,
    };

    const existingInput = targetElement.textContent || "";
    const currentOutputArr = existingInput.split("");
    currentOutputArr.splice(
        selection.startOffset,
        selection.endOffset - selection.startOffset,
        event.key
    );
    const currentInput = currentOutputArr.join("");

    if (!numericInputRegex.test(currentInput)) {
        event.preventDefault();
    }
}
