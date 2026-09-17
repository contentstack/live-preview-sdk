import { vi, describe, it, expect, beforeEach } from "vitest";
import { ignoreMissingListener } from "../postMessageErrors";
import { PublicLogger } from "../../../logger/logger";

describe("ignoreMissingListener", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("stays silent when the receiver is simply not mounted", () => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener("request-discussion-highlights")({
            code: "NO_REQUEST_LISTENER_FOUND",
            message: 'No request listener found for event "x"',
        });

        expect(warn).not.toHaveBeenCalled();
    });

    it.each([
        "NO_ACK_RECEIVED",
        "WINDOW_CLOSED",
        "CODE_RETURNED_ERROR",
    ])("warns on %s so a real failure is still visible", (code) => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener("request-discussion-highlights")({ code });

        expect(warn).toHaveBeenCalledOnce();
        expect(warn.mock.calls[0][0]).toContain(
            "request-discussion-highlights"
        );
    });

    it("warns when the rejection is not a coded object", () => {
        const warn = vi.spyOn(PublicLogger, "warn").mockImplementation(() => {});

        ignoreMissingListener("some-event")(new Error("boom"));

        expect(warn).toHaveBeenCalledOnce();
    });
});
