/**
 * DOM-level lookups for the docked builder panel.
 *
 * Deliberately free of imports: the live-preview event hooks need to ask
 * "is the panel docked?" and pulling in `builderPanel` (which imports the event
 * managers) from there would close an import cycle.
 */

export const PANEL_ID = "cs-builder-panel";

export function getPanelElement(): HTMLElement | null {
    return document.getElementById(PANEL_ID);
}

export function getPanelWindow(): Window | null {
    return getPanelElement()?.querySelector("iframe")?.contentWindow ?? null;
}

export function isPanelOpen(): boolean {
    return Boolean(getPanelElement());
}
