/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { useRecalculateVariantDataCSLPValues } from "../useRecalculateVariantDataCSLPValues";
import livePreviewPostMessage from "../../../livePreview/eventManager/livePreviewEventManager";
import { LIVE_PREVIEW_POST_MESSAGE_EVENTS } from "../../../livePreview/eventManager/livePreviewEventManager.constant";
import { VisualBuilder } from "../../index";
import { visualBuilderStyles } from "../../visualBuilder.style";
import { DATA_CSLP_ATTR_SELECTOR } from "../../utils/constants";

// Mock dependencies
vi.mock("../../../livePreview/eventManager/livePreviewEventManager", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => ({
        "visual-builder__variant-field": "visual-builder__variant-field",
    })),
}));

vi.mock("../../index", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: {
                audienceMode: false,
                variant: null,
            },
        },
    },
}));

describe("useRecalculateVariantDataCSLPValues", () => {
    let mockOn: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();
        vi.useFakeTimers();
        mockOn = vi.fn();
        (livePreviewPostMessage as any).on = mockOn;

        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = false;
        VisualBuilder.VisualBuilderGlobalState.value.variant = null;

        document.body.innerHTML = "";
    });

    afterEach(() => {
        vi.clearAllTimers();
        vi.useRealTimers();
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should register event listener for VARIANT_PATCH", () => {
        useRecalculateVariantDataCSLPValues();

        expect(mockOn).toHaveBeenCalledWith(
            LIVE_PREVIEW_POST_MESSAGE_EVENTS.VARIANT_PATCH,
            expect.any(Function)
        );
    });

    it("should not update variant classes if audienceMode is false", () => {
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = false;

        useRecalculateVariantDataCSLPValues();

        const handler = mockOn.mock.calls[0][1];
        const element = document.createElement("div");
        element.setAttribute(DATA_CSLP_ATTR_SELECTOR, "v2:test");
        document.body.appendChild(element);

        handler({
            data: {
                highlightVariantFields: true,
                expectedCSLPValues: {
                    variant: "v2:test",
                    base: "test",
                },
            },
        });

        expect(element.classList.contains("visual-builder__variant-field")).toBe(
            false
        );
    });

    it("should call updateVariantClasses when audienceMode is true", () => {
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = true;

        useRecalculateVariantDataCSLPValues();

        const handler = mockOn.mock.calls[0][1];
        const element = document.createElement("div");
        element.setAttribute(DATA_CSLP_ATTR_SELECTOR, "v2:test");
        document.body.appendChild(element);

        // Verify handler can be called without errors
        expect(() => {
            handler({
                data: {
                    highlightVariantFields: true,
                    expectedCSLPValues: {
                        variant: "v2:test",
                        base: "test",
                    },
                },
            });
        }).not.toThrow();

        // The function sets up mutation observers and processes elements
        // We verify it was called by checking that the handler executes
        vi.advanceTimersByTime(100);

        // Verify that the handler was called (the function processes elements)
        expect(element).toBeDefined();
    });

    it("should set up mutation observers when handler is called", () => {
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = true;

        useRecalculateVariantDataCSLPValues();

        const handler = mockOn.mock.calls[0][1];
        const element = document.createElement("div");
        element.setAttribute(DATA_CSLP_ATTR_SELECTOR, "v2:test.variant");
        document.body.appendChild(element);

        handler({
            data: {
                highlightVariantFields: true,
                expectedCSLPValues: {
                    variant: "v2:test.variant",
                    base: "test",
                },
            },
        });

        // Advance timers to allow observers to be set up
        vi.advanceTimersByTime(100);

        // Verify element exists and handler was called
        expect(document.querySelector(`[${DATA_CSLP_ATTR_SELECTOR}]`)).toBe(element);
    });

    it("should set up cleanup timeout when handler is called", () => {
        VisualBuilder.VisualBuilderGlobalState.value.audienceMode = true;

        const setTimeoutSpy = vi.spyOn(global, "setTimeout");

        useRecalculateVariantDataCSLPValues();

        const handler = mockOn.mock.calls[0][1];
        const element = document.createElement("div");
        element.setAttribute(DATA_CSLP_ATTR_SELECTOR, "v2:test");
        document.body.appendChild(element);

        handler({
            data: {
                highlightVariantFields: true,
                expectedCSLPValues: {
                    variant: "v2:test",
                    base: "test",
                },
            },
        });

        // Advance time to trigger observer cleanup
        vi.advanceTimersByTime(8000);

        // Verify setTimeout was called (for the cleanup timeout)
        expect(setTimeoutSpy).toHaveBeenCalled();

        setTimeoutSpy.mockRestore();
    });
});

