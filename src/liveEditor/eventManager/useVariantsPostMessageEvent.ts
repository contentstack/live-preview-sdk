import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface VariantFieldsEvent {
    data: {
        variant_data: {
            variant: string;
        };
    };
}

function addVariantFieldClass(variant_uid: string): void {
    const elements = document.querySelectorAll(`[data-cslp]`);
    elements.forEach((element) => {
        const dataCslp = element.getAttribute("data-cslp");
        if (dataCslp && new RegExp(variant_uid).test(dataCslp)) {
            element.classList.add("visual-editor__variant-field");
        }
    });
}

function removeVariantFieldClass(): void {
    const variantFieldElements = document.querySelectorAll(
        ".visual-editor__variant-field"
    );
    variantFieldElements.forEach((element) => {
        element.classList.remove("visual-editor__variant-field");
    });
}

export function useVariantFieldsPostMessageEvent(): void {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.SHOW_VARIANT_FIELDS,
        (event: VariantFieldsEvent) => {
            removeVariantFieldClass();
            addVariantFieldClass(event.data.variant_data.variant);
        }
    );
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.REMOVE_VARIANT_FIELDS,
        () => {
            removeVariantFieldClass();
        }
    );
}
