/** Session storage the docked panel keeps across a page reload. */
export enum PanelSessionKey {
    /** The side form was open when the page went. */
    FormOpen = "cs-builder-panel-form-open",
    /** The editor, not the user, reloaded the page (an SSR edit). */
    EditorReload = "cs-builder-panel-editor-reload",
}

export enum PanelSessionFlag {
    Set = "set",
}

const isSet = (key: PanelSessionKey) =>
    sessionStorage.getItem(key) === PanelSessionFlag.Set;

/** Called just before the SDK reloads the page for an edit (SSR), so the docked form comes back as it was. */
export function markEditorReload(): void {
    sessionStorage.setItem(PanelSessionKey.EditorReload, PanelSessionFlag.Set);
}

export function rememberFormOpen(open: boolean): void {
    if (open)
        sessionStorage.setItem(PanelSessionKey.FormOpen, PanelSessionFlag.Set);
    else sessionStorage.removeItem(PanelSessionKey.FormOpen);
}

/** Whether the editor, not the user, is reloading this page right now. */
export function isEditorReloading(): boolean {
    return isSet(PanelSessionKey.EditorReload);
}

/** How this page came to load: whether the editor reloaded it, and whether the form was open. Reads once. */
export function takeEditorReload(): { byEditor: boolean; formOpen: boolean } {
    const state = {
        byEditor: isSet(PanelSessionKey.EditorReload),
        formOpen: isSet(PanelSessionKey.FormOpen),
    };
    sessionStorage.removeItem(PanelSessionKey.EditorReload);
    sessionStorage.removeItem(PanelSessionKey.FormOpen);
    return state;
}
