import { VisualBuilder } from "..";
import { visualBuilderStyles } from "../visualBuilder.style";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";

interface VariantFieldsEvent {
    data: {
        variant_data: {
            variant: string;
            highlightVariantFields: boolean;
            variantOrder: string[];
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

function isLowerOrderVariant(variant_uid: string, dataCslp: string, variantOrder: string[]): boolean {
    if(!variantOrder || variantOrder.length === 0) {
        return false;
    }
    const indexOfVariant = variantOrder.indexOf(variant_uid);
    let indexOfDataCslp = -1;
    for (let i = variantOrder.length-1; i >= 0; i--) {
        if (dataCslp.includes(variantOrder[i])) {
            indexOfDataCslp = i;
            break;
        }
    }
    if(indexOfDataCslp < 0) {
        return false;
    }
    return indexOfDataCslp < indexOfVariant;
}

export function addVariantFieldClass(
    variant_uid: string,
    highlightVariantFields: boolean,
    variantOrder: string[]
): void {
    const elements = document.querySelectorAll(`[data-cslp]`);
    elements.forEach((element) => {
        const dataCslp = element.getAttribute("data-cslp");
        if (!dataCslp) return;

        if (dataCslp?.includes(variant_uid)) {
            highlightVariantFields &&
                element.classList.add(
                    visualBuilderStyles()["visual-builder__variant-field"]
                );
            element.classList.add("visual-builder__variant-field");
        } else if (!dataCslp.startsWith("v2:")) {
            element.classList.add("visual-builder__base-field");
        } 
        else if (isLowerOrderVariant(variant_uid, dataCslp, variantOrder)) {
            element.classList.add("visual-builder__variant-field");
        }
        else {
            element.classList.add("visual-builder__disabled-variant-field");
        }
    });
}

export function removeVariantFieldClass(
    onlyHighlighted: boolean = false
): void {
    if (onlyHighlighted) {
        const variantElements = document.querySelectorAll(
            `.${visualBuilderStyles()["visual-builder__variant-field"]}`
        );
        variantElements.forEach((element) => {
            element.classList.remove(
                visualBuilderStyles()["visual-builder__variant-field"]
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
                visualBuilderStyles()["visual-builder__variant-field"],
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

export function useVariantFieldsPostMessageEvent(): void {
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.GET_VARIANT_ID,
        (event: VariantEvent) => {
            setVariant(event.data.variant);
            // clear field schema when variant is changed.
            // this is required as we cache field schema
            // which contain a key isUnlinkedVariant.
            // This key can change when variant is changed,
            // so clear the field schema cache
            FieldSchemaMap.clear();
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
                event.data.variant_data.highlightVariantFields,
                event.data.variant_data.variantOrder
            );
        }
    );
    visualBuilderPostMessage?.on(
        VisualBuilderPostMessageEvents.REMOVE_VARIANT_FIELDS,
        (event: RemoveVariantFieldsEvent) => {
            removeVariantFieldClass(event?.data?.onlyHighlighted);
        }
    );
}
