import { VisualBuilder } from "..";
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
        if(!dataCslp) return;
        if (new RegExp(variant_uid).test(dataCslp)) {
            element.classList.add(
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__variant-field"
            );
        }
        // For base variant editing
        if (!dataCslp.startsWith("v2:")){
            element.classList.add(
                visualBuilderStyles()["visual-builder__variant-field"],
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__base-field"],
                "visual-builder__base-field"
            );
        }
    });
}

function removeVariantFieldClass(): void {
    const variantFieldElements = document.querySelectorAll(
        ".visual-builder__variant-field"
    );
    variantFieldElements.forEach((element) => {
        element.classList.remove(
            visualBuilderStyles()["visual-builder__variant-field"],
            ".visual-builder__variant-field",
            visualBuilderStyles()["visual-builder__base-field"],
            "visual-builder__base-field"
        );
    });
}

function setAudienceMode(mode: boolean): void {
    VisualBuilder.VisualBuilderGlobalState.value.audienceMode = mode;
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
