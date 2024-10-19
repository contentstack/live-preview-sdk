import { VisualBuilder } from "..";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";

interface VariantFieldsEvent {
    data: {
        variant_data: {
            variant: string;
            highlightVariantFields: boolean;
        };
    };
}

interface AudienceEvent {
    data: {
        audienceMode: boolean;
    };
}
interface VariantEvent {
    data: {
        variant: string | null;
    };
}

interface LocaleEvent {
    data: {
        locale: string;
    };
}
function addVariantFieldClass(
    variant_uid: string,
    highlightVariantFields: boolean
): void {
    const elements = document.querySelectorAll(`[data-cslp]`);
    elements.forEach((element) => {
        const dataCslp = element.getAttribute("data-cslp");
        if (!dataCslp) return;

        if (new RegExp(variant_uid).test(dataCslp)) {
            highlightVariantFields &&
                element.classList.add(
                    visualBuilderStyles()["visual-builder__variant-field"]
                );
            element.classList.add("visual-builder__variant-field");
        } else if (!dataCslp.startsWith("v2:")) {
            element.classList.add("visual-builder__base-field");
        } else {
            element.classList.add("visual-builder__disabled-variant-field");
        }
    });
}

function removeVariantFieldClass(): void {
    const variantAndBaseFieldElements = document.querySelectorAll(
        ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
    );
    variantAndBaseFieldElements.forEach((element) => {
        element.classList.remove(
            "visual-builder__disabled-variant-field",
            "visual-builder__variant-field",
            visualBuilderStyles()["visual-builder__variant-field"],
            "visual-builder__base-field"
        );
    });
}

function setAudienceMode(mode: boolean): void {
    VisualBuilder.VisualBuilderGlobalState.value.audienceMode = mode;
}
function setVariant(uid: string | null): void {
    VisualBuilder.VisualBuilderGlobalState.value.variant = uid;
}
function setLocale(locale: string): void {
    VisualBuilder.VisualBuilderGlobalState.value.locale = locale;
}

export function useVariantFieldsPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.GET_VARIANT_ID,
        (event: VariantEvent) => {
            setVariant(event.data.variant);
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.GET_LOCALE,
        (event: LocaleEvent) => {
            setLocale(event.data.locale);
        }
    );
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
            addVariantFieldClass(
                event.data.variant_data.variant,
                event.data.variant_data.highlightVariantFields
            );
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS,
        () => {
            removeVariantFieldClass();
        }
    );
}
