import { PublicLogger } from "../../logger/logger";
import { VisualBuilderPostMessageEvents } from "./types/postMessage.types";

// adv-post-message does not export ERROR_CODES from its entry point, so the
// wire value is matched directly.
const NO_REQUEST_LISTENER_FOUND = "NO_REQUEST_LISTENER_FOUND";

/**
 * Rejection handler for sends whose receiver is only mounted some of the time.
 *
 * Only the missing-listener reply carries a `code`; the library's other
 * rejections are an uncoded `Error` (closed window) or a bare string (no ack),
 * so they fall through to the warning. That is deliberate: a receiver that
 * never acks is not the same as one that answered "nobody is listening".
 */
export function ignoreMissingListener(
    event: VisualBuilderPostMessageEvents
): (error: unknown) => void {
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
