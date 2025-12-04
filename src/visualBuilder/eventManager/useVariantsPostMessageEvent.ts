import { VisualBuilder } from "..";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { updateVariantClasses } from "./useRecalculateVariantDataCSLPValues";
import { debounce } from "lodash-es";

interface VariantFieldsEvent {
    data: {
        variant_data: {
            variant: string;
            highlightVariantFields: boolean;
        };
    };
}
interface RemoveVariantFieldsEvent {
    data: {
        onlyHighlighted?: boolean;
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
export function addVariantFieldClass(variant_uid: string): void {
    const highlightVariantFields = VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields;
    const elements = document.querySelectorAll(`[data-cslp]`);
    elements.forEach((element) => {
        const dataCslp = element.getAttribute("data-cslp");
        if (!dataCslp) return;

        if (dataCslp?.includes(variant_uid)) {
            element.classList.add("visual-builder__variant-field");
            if (highlightVariantFields) {
                element.classList.add(
                    visualBuilderStyles()["visual-builder__variant-field-outline"]
                );
            }
        } else if (!dataCslp.startsWith("v2:")) {
            element.classList.add("visual-builder__base-field");
        } else {
            element.classList.add("visual-builder__disabled-variant-field");
        }
    });
}

export const debounceAddVariantFieldClass = debounce(
    (variant_uid: string): void => {
        addVariantFieldClass(variant_uid);
    },
    1000,
    { trailing: true }
) as (variant_uid: string) => void;

export function removeVariantFieldClass(
    onlyHighlighted: boolean = false
): void {
    if (onlyHighlighted) {
        const variantElements = document.querySelectorAll(
            `.${visualBuilderStyles()["visual-builder__variant-field-outline"]}`
        );
        variantElements.forEach((element) => {
            element.classList.remove(
                visualBuilderStyles()["visual-builder__variant-field-outline"]
            );
        });
    } else {
        const variantAndBaseFieldElements = document.querySelectorAll(
            ".visual-builder__disabled-variant-field, .visual-builder__variant-field, .visual-builder__base-field"
        );
        variantAndBaseFieldElements.forEach((element) => {
            element.classList.remove(
                "visual-builder__disabled-variant-field",
                "visual-builder__variant-field",
                visualBuilderStyles()["visual-builder__variant-field-outline"],
                "visual-builder__base-field"
            );
        });
    }
}

export function setAudienceMode(mode: boolean): void {
    VisualBuilder.VisualBuilderGlobalState.value.audienceMode = mode;
}
export function setVariant(uid: string | null): void {
    VisualBuilder.VisualBuilderGlobalState.value.variant = uid;
}
export function setLocale(locale: string): void {
    VisualBuilder.VisualBuilderGlobalState.value.locale = locale;
}
export function setHighlightVariantFields(highlight: boolean): void {
    VisualBuilder.VisualBuilderGlobalState.value.highlightVariantFields = highlight;
}

interface GetHighlightVariantFieldsStatusResponse {
    highlightVariantFields: boolean;
}
export async function getHighlightVariantFieldsStatus(): Promise<GetHighlightVariantFieldsStatusResponse> {
    try {
        const result = await visualBuilderPostMessage?.send<GetHighlightVariantFieldsStatusResponse>(
            VisualBuilderPostMessageEvents.GET_HIGHLIGHT_VARIANT_FIELDS_STATUS
        );   
        return result ?? {
            highlightVariantFields: false,
        };
    } catch (error) {
        console.error("Failed to get highlight variant fields status:", error);
        return {
            highlightVariantFields: false,
        };
    }
}

export function useVariantFieldsPostMessageEvent({ isSSR }: { isSSR: boolean }): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.GET_VARIANT_ID,
        (event: VariantEvent) => {
            const selectedVariant = event.data.variant;
            setVariant(selectedVariant);
            // clear field schema when variant is changed.
            // this is required as we cache field schema
            // which contain a key isUnlinkedVariant.
            // This key can change when variant is changed,
            // so clear the field schema cache
            FieldSchemaMap.clear();
            if(isSSR) {
                if(selectedVariant) {
                    addVariantFieldClass(selectedVariant);
                }
            } else {
                // recalculate and apply classes
                updateVariantClasses();
            }
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
            setHighlightVariantFields(event.data.variant_data.highlightVariantFields);
            removeVariantFieldClass();
            addVariantFieldClass(event.data.variant_data.variant);
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS,
        (event: RemoveVariantFieldsEvent) => {
            removeVariantFieldClass(event?.data?.onlyHighlighted);
        }
    );
}
