import { VisualEditor } from "..";
import { liveEditorStyles } from "../liveEditor.style";
import liveEditorPostMessage from "../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../utils/types/postMessage.types";

interface VariantFieldsEvent {
    data: {
        variant_data: {
            variant: string;
        };
    };
}

interface AudienceEvent {
    data: {
        audienceMode: boolean;
    };
}

function addVariantFieldClass(variant_uid: string): void {
    const elements = document.querySelectorAll(`[data-cslp]`);
    elements.forEach((element) => {
        const dataCslp = element.getAttribute("data-cslp");
        if (dataCslp && new RegExp(variant_uid).test(dataCslp)) {
            element.classList.add(
                liveEditorStyles()["visual-builder__variant-field"]
            );
        }
    });
}

function removeVariantFieldClass(): void {
    const variantFieldElements = document.querySelectorAll(
        `.${liveEditorStyles()["visual-builder__variant-field"]}`
    );
    variantFieldElements.forEach((element) => {
        element.classList.remove(
            liveEditorStyles()["visual-builder__variant-field"]
        );
    });
}

function setAudienceMode(mode: boolean): void {
    VisualEditor.VisualEditorGlobalState.value.audienceMode = mode;
}

export function useVariantFieldsPostMessageEvent(): void {
    liveEditorPostMessage?.on(
        LiveEditorPostMessageEvents.SET_AUDIENCE_MODE,
        (event: AudienceEvent) => {
            setAudienceMode(event.data.audienceMode);
        }
    );
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
