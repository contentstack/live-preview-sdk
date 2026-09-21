import { vi, describe, it, expect, beforeEach } from "vitest";
import { ignoreMissingListener } from "../postMessageErrors";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import { PublicLogger } from "../../../logger/logger";

const EVENT = VisualBuilderPostMessageEvents.REQUEST_DISCUSSION_HIGHLIGHTS;

describe("ignoreMissingListener", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    // The only rejection adv-post-message sends back with a code: the receiver
    // acked, looked for a listener and found none.
    it("stays silent when the receiver answers that nobody is listening", () => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener(EVENT)({
            code: "NO_REQUEST_LISTENER_FOUND",
            message:
                'No request listener found for event "request-discussion-highlights"',
        });

        expect(warn).not.toHaveBeenCalled();
    });

    // The shapes the library's own timeout paths reject with. Neither carries a
    // code, so both must fall through to the warning.
    it.each([
        ["an Error, as the closed-window path rejects", new Error("closed")],
        [
            "a bare string, as the no-ack timeout rejects",
            "contentstack-adv-post-message: The ACK was not received",
        ],
    ])("warns on %s so a real failure stays visible", (_shape, error) => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener(EVENT)(error);

        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain(EVENT);
    });

    it("warns on a coded rejection that is not the missing listener", () => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener(EVENT)({ code: "SOMETHING_ELSE" });

        expect(warn).toHaveBeenCalledOnce();
    });
});
