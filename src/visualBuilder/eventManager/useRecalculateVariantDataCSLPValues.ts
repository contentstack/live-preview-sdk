import { VisualBuilder } from "..";
import livePreviewPostMessage from "../../livePreview/eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../../livePreview/eventManager/livePreviewEventManager.constant";
import { DATA_CSLP_ATTR_SELECTOR } from "../utils/constants";
import { visualBuilderStyles } from "../visualBuilder.style";

const VARIANT_UPDATE_DELAY_MS: Readonly<number> = 4000;

type OnAudienceModeVariantPatchUpdate = {
    expectedCSLPValues: Record<"variant" | "base", string>;
    highlightVariantFields: boolean;
};

/**
 * Registers a post message event listener for updating the variant / base classes in the live preview for audience mode.
 */
export function useRecalculateVariantDataCSLPValues(): void {
    livePreviewPostMessage?.on<OnAudienceModeVariantPatchUpdate>(
        LIVE_PREVIEW_POST_MESSAGE_EVENTS.VARIANT_PATCH,
        (event) => {
            if (VisualBuilder.VisualBuilderGlobalState.value.audienceMode) {
                updateVariantClasses(event.data);
            }
        }
    );
}

function updateVariantClasses({
    expectedCSLPValues,
    highlightVariantFields,
}: OnAudienceModeVariantPatchUpdate): void {
    const variantElement = document.querySelector(
        `[${DATA_CSLP_ATTR_SELECTOR}="${expectedCSLPValues.variant}"]`
    );
    if (variantElement) {
        // No need to recalculate classList for variant fields
        return;
    } else {
        const baseElement = document.querySelector(
            `[${DATA_CSLP_ATTR_SELECTOR}="${expectedCSLPValues.base}"]`
        );
        if (!baseElement) return;

        let hasObserverDisconnected = false;
        let timeoutId: ReturnType<typeof setTimeout> | null = null;

        const observer = new MutationObserver((mutations, obs) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === DATA_CSLP_ATTR_SELECTOR
                ) {
                    const element = mutation.target as HTMLElement;
                    const dataCslp = element.getAttribute(
                        DATA_CSLP_ATTR_SELECTOR
                    );
                    if (!dataCslp) return;
                    if (
                        dataCslp.startsWith("v2:") &&
                        element.classList.contains("visual-builder__base-field")
                    ) {
                        element.classList.remove("visual-builder__base-field");
                        if (highlightVariantFields) {
                            // Append class and styles
                            element.classList.add(
                                visualBuilderStyles()[
                                    "visual-builder__variant-field"
                                ],
                                "visual-builder__variant-field"
                            );
                        } else {
                            // Append only class
                            element.classList.add(
                                "visual-builder__variant-field"
                            );
                        }
                    }
                    obs.disconnect();
                    hasObserverDisconnected = true;
                    return;
                }
            });
            if (!hasObserverDisconnected && !timeoutId) {
                // disconnect the observer whether we found the new instance or not after timeout
                timeoutId = setTimeout(() => {
                    obs.disconnect();
                    hasObserverDisconnected = false;
                }, VARIANT_UPDATE_DELAY_MS);
            }
        });

        observer.observe(baseElement, { attributes: true });
    }
}
