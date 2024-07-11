export enum LiveEditorPostMessageEvents {
    INIT = "init",
    ADD_INSTANCE = "add-instance",
    UPDATE_FIELD = "update-field",
    OPEN_ASSET_MODAL = "open-asset-modal",
    OPEN_REFERENCE_MODAL = "open-reference-modal",
    OPEN_QUICK_FORM = "open-quick-form",
    GET_FIELD_SCHEMA = "get-field-schema",
    GET_FIELD_DATA = "get-field-data",
    GET_FIELD_PATH_WITH_UID = "get-field-path-with-uid",
    FOCUS_FIELD = "focus-field",
    OPEN_FIELD_EDIT_MODAL = "open-field-edit-modal",
    DELETE_INSTANCE = "delete-instance",
    MOVE_INSTANCE = "move-instance",
    // FROM visual editor
    GET_ALL_ENTRIES_IN_CURRENT_PAGE = "get-entries-in-current-page",
    HIDE_FOCUS_OVERLAY = "hide-focus-overlay",
}
