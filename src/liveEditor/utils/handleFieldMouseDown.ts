import {
    LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY,
    numericInputRegex,
} from "./constants";

export function handleFieldInput(e: Event): void {
    const event = e as InputEvent;
    const targetElement = event.target as HTMLElement;

    if (event.type === "input") {
        // do something
    }
}

export function handleFieldKeyDown(e: Event): void {
    const event = e as KeyboardEvent;
    const targetElement = event.target as HTMLElement;
    const fieldType = targetElement.getAttribute(
        LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
    );

    if (fieldType === "number") {
        handleNumericFieldKeyDown(event);
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
