import { PublicLogger } from "../../logger/logger";

// adv-post-message does not export ERROR_CODES from its entry point, so the
// wire value is matched directly.
const NO_REQUEST_LISTENER_FOUND = "NO_REQUEST_LISTENER_FOUND";

/**
 * Rejection handler for sends whose receiver is only mounted some of the time.
 * A missing listener is the expected state and stays silent; every other
 * failure (no ack, closed window, a throwing receiver) is warned about so a
 * real breakage stays visible.
 */
export function ignoreMissingListener(event: string): (error: unknown) => void {
    return (error: unknown) => {
        if ((error as { code?: string })?.code === NO_REQUEST_LISTENER_FOUND) {
            return;
        }
        PublicLogger.warn(
            `Failed to send "${event}" to the visual builder`,
            error
        );
    };
}
