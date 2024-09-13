import { VisualEditor } from "..";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

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
                visualBuilderStyles()["visual-builder__variant-field"]
            );
        }
    });
}

function removeVariantFieldClass(): void {
    const variantFieldElements = document.querySelectorAll(
        `.${visualBuilderStyles()["visual-builder__variant-field"]}`
    );
    variantFieldElements.forEach((element) => {
        element.classList.remove(
            visualBuilderStyles()["visual-builder__variant-field"]
        );
    });
}

function setAudienceMode(mode: boolean): void {
    VisualEditor.VisualEditorGlobalState.value.audienceMode = mode;
}

export function useVariantFieldsPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.SET_AUDIENCE_MODE,
        (event: AudienceEvent) => {
            setAudienceMode(event.data.audienceMode);
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.SHOW_VARIANT_FIELDS,
        (event: VariantFieldsEvent) => {
            removeVariantFieldClass();
            addVariantFieldClass(event.data.variant_data.variant);
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS,
        () => {
            removeVariantFieldClass();
        }
    );
}
