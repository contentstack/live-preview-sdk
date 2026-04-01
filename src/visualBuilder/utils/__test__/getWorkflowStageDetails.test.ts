import { describe, it, expect, vi, beforeEach } from "vitest";
import { getWorkflowStageDetails } from "../getWorkflowStageDetails";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";

vi.mock("../visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

import visualBuilderPostMessage from "../visualBuilderPostMessage";

describe("getWorkflowStageDetails", () => {
    beforeEach(() => {
        vi.mocked(visualBuilderPostMessage!.send).mockReset();
    });

    it("returns payload from postMessage when present", async () => {
        const payload = {
            stage: { name: "Draft" },
            permissions: { entry: { update: true } },
            requestEditAccess: { canRequest: true, hasPending: false },
        };
        vi.mocked(visualBuilderPostMessage!.send).mockResolvedValue(payload);

        const result = await getWorkflowStageDetails({
            entryUid: "e1",
            contentTypeUid: "ct1",
            locale: "en-us",
            variantUid: "v1",
        });

        expect(visualBuilderPostMessage!.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.GET_WORKFLOW_STAGE_DETAILS,
            {
                entryUid: "e1",
                contentTypeUid: "ct1",
                locale: "en-us",
                variantUid: "v1",
            }
        );
        expect(result).toEqual(payload);
    });

    it("returns permissive fallback when send returns undefined", async () => {
        vi.mocked(visualBuilderPostMessage!.send).mockResolvedValue(undefined);

        const result = await getWorkflowStageDetails({
            entryUid: "e1",
            contentTypeUid: "ct1",
            locale: "en-us",
        });

        expect(result).toEqual({
            stage: { name: "Unknown" },
            permissions: { entry: { update: true } },
            requestEditAccess: { canRequest: false, hasPending: false },
        });
    });

    it("returns permissive fallback when send throws", async () => {
        vi.mocked(visualBuilderPostMessage!.send).mockRejectedValue(
            new Error("network")
        );

        const result = await getWorkflowStageDetails({
            entryUid: "e1",
            contentTypeUid: "ct1",
            locale: "en-us",
        });

        expect(result.stage?.name).toBe("Unknown");
        expect(result.permissions.entry.update).toBe(true);
        expect(result.requestEditAccess).toEqual({
            canRequest: false,
            hasPending: false,
        });
    });
});
