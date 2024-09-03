export const TIMELINE_CHANNEL_ID = "timeline";

export const timelinePostMessageEvents = {
    SEND_CURRENT_BASE_ROUTE: "send-current-base-route",
    SEND_CSLP_DATA: "send-cslp-data",
    DIFF_VALUE: "diff-value",
    REMOVE_DIFF: "remove-diff",
} as const;
