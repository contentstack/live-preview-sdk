import { VisualBuilder } from "..";

/**
 * Whether the parent refused a toolbar action because a collaborator holds the
 * field lock. It answers OPEN_ASSET_MODAL, OPEN_REFERENCE_MODAL and ADD_INSTANCE
 * with `{ fieldLockRefused: true }` and does not open the modal.
 */
export function isFieldLockRefused(response: unknown): boolean {
    return (
        (response as { fieldLockRefused?: unknown } | null | undefined)
            ?.fieldLockRefused === true
    );
}

/**
 * Whether the canvas selection is still the field with this cslp. The refusal
 * arrives after a lock round trip, by which time the user may have selected
 * another field, and deselecting that one would be wrong.
 */
export function isFieldStillSelected(cslp: string): boolean {
    const selected =
        VisualBuilder.VisualBuilderGlobalState.value
            .previousSelectedEditableDOM;
    return !!selected && selected.getAttribute("data-cslp") === cslp;
}
