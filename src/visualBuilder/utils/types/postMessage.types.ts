export enum VisualBuilderPostMessageEvents {
    INIT = "init",
    ADD_INSTANCE = "add-instance",
    UPDATE_FIELD = "update-field",
    SYNC_FIELD = "sync-field",
    OPEN_ASSET_MODAL = "open-asset-modal",
    OPEN_REFERENCE_MODAL = "open-reference-modal",
    OPEN_QUICK_FORM = "open-quick-form",
    TOGGLE_FORM = "toggle-quick-form",
    GET_FIELD_SCHEMA = "get-field-schema",
    GET_FIELD_DATA = "get-field-data",
    GET_FIELD_PATH_WITH_UID = "get-field-path-with-uid",
    GET_FIELD_DISPLAY_NAMES = "get-field-display-names",
    MOUSE_CLICK = "mouse-click",
    FOCUS_FIELD = "focus-field",
    OPEN_FIELD_EDIT_MODAL = "open-field-edit-modal",
    DELETE_INSTANCE = "delete-instance",
    MOVE_INSTANCE = "move-instance",
    GET_DISCUSSION_ID = "get-discussion-id-for-comment-modal",
    OPEN_FIELD_COMMENT_MODAL = "open-field-comment-modal",
    COLLAB_CREATE_THREAD = "collab-create-thread",
    COLLAB_CREATE_COMMENT = "collab-create-comment",
    COLLAB_FETCH_COMMENTS = "collab-fetch-comments",
    COLLAB_EDIT_COMMENT = "collab-edit-comment",
    COLLAB_DELETE_COMMENT = "collab-delete-comment",
    COLLAB_RESOLVE_THREAD = "collab-resolve-thread",
    COLLAB_DELETE_THREAD = "collab-delete-thread",

    // FROM visual builder
    GET_ALL_ENTRIES_IN_CURRENT_PAGE = "get-entries-in-current-page",
    HIDE_FOCUS_OVERLAY = "hide-focus-overlay",
    SHOW_DRAFT_FIELDS = "show-draft-fields",
    REMOVE_DRAFT_FIELDS = "remove-draft-fields",
    SHOW_VARIANT_FIELDS = "show-variant-fields",
    REMOVE_VARIANT_FIELDS = "remove-variant-fields",
    SET_AUDIENCE_MODE = "set-audience-mode",
    UPDATE_DISCUSSION_ID = "update-discussion-id-for-focus-field",
    SCROLL_TO_FIELD = "scroll-to-view-field-by-cslp-value",
    HIGHLIGHT_ACTIVE_COMMENTS = "highlight-active-comments-by-data-cs",
    REMOVE_HIGHLIGHTED_COMMENTS = "remove-highlighted-comments",
    GET_VARIANT_ID = "get-variant-id",
    GET_LOCALE = "get-locale",
    SEND_VARIANT_AND_LOCALE = "send-variant-and-locale",
    COLLAB_ENABLE = "collab-enable",
    COLLAB_DISABLE = "collab-disable",
    COLLAB_THREAD_REMOVE = "collab-thread-remove",
    COLLAB_THREAD_REOPEN = "collab-thread-reopen",
}
