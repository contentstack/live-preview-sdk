import { vi, describe, it, expect, beforeEach } from "vitest";
import { VisualBuilder } from "../..";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import { getFieldData } from "../../utils/getFieldData";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { useRevalidateFieldDataPostMessageEvent } from "../useRevalidateFieldDataPostMessageEvent";

// Mock dependencies
vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        clearContentTypeSchema: vi.fn(),
        clear: vi.fn(),
        getFieldSchema: vi.fn(),
    },
}));

vi.mock("../../utils/getFieldData", () => ({
    getFieldData: vi.fn(),
}));

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        on: vi.fn(),
    },
}));

vi.mock("../../../cslp", () => ({
    extractDetailsFromCslp: vi.fn(),
}));

// Mock window.location.reload
Object.defineProperty(window, "location", {
    value: {
        reload: vi.fn(),
    },
    writable: true,
});

describe("useRevalidateFieldDataPostMessageEvent", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Reset VisualBuilder global state
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                previousHoveredTargetDOM: null,
                previousSelectedEditableDOM: null,
            },
        };
    });

    it("should register post message event listener", () => {
        useRevalidateFieldDataPostMessageEvent();

        expect(visualBuilderPostMessage.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REVALIDATE_FIELD_DATA,
            expect.any(Function)
        );
    });

    describe("handleRevalidateFieldData", () => {
        let mockHandleRevalidateFieldData: any;

        beforeEach(() => {
            useRevalidateFieldDataPostMessageEvent();
            mockHandleRevalidateFieldData = (visualBuilderPostMessage.on as any)
                .mock.calls[0][1];
        });

        it("should revalidate specific field when hovered element exists", async () => {
            const mockElement = document.createElement("div");
            mockElement.setAttribute("data-cslp", "content_type.entry.field");

            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                mockElement;

            const mockExtractDetailsFromCslp = await import("../../../cslp");
            vi.mocked(
                mockExtractDetailsFromCslp.extractDetailsFromCslp
            ).mockReturnValue({
                content_type_uid: "test_content_type",
                entry_uid: "test_entry",
                locale: "en-us",
                fieldPath: "test_field",
                fieldPathWithIndex: "test_field",
            });

            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                test: "schema",
            });
            vi.mocked(getFieldData).mockResolvedValue({ test: "data" });

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clearContentTypeSchema).toHaveBeenCalledWith(
                "test_content_type"
            );
            expect(FieldSchemaMap.getFieldSchema).toHaveBeenCalledWith(
                "test_content_type",
                "test_field"
            );
            expect(getFieldData).toHaveBeenCalledWith(
                {
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                },
                "test_field"
            );
            expect(window.location.reload).not.toHaveBeenCalled();
        });

        it("should fallback to focused element when no hovered element", async () => {
            const mockElement = document.createElement("div");
            mockElement.setAttribute("data-cslp", "content_type.entry.field");

            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                null;
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                mockElement;

            const mockExtractDetailsFromCslp = await import("../../../cslp");
            vi.mocked(
                mockExtractDetailsFromCslp.extractDetailsFromCslp
            ).mockReturnValue({
                content_type_uid: "test_content_type",
                entry_uid: "test_entry",
                locale: "en-us",
                fieldPath: "test_field",
                fieldPathWithIndex: "test_field",
            });

            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                test: "schema",
            });
            vi.mocked(getFieldData).mockResolvedValue({ test: "data" });

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clearContentTypeSchema).toHaveBeenCalledWith(
                "test_content_type"
            );
        });

        it("should clear all field schema cache when no target element", async () => {
            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                null;
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                null;

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clear).toHaveBeenCalled();
            expect(window.location.reload).not.toHaveBeenCalled();
        });

        it("should refresh iframe when field schema validation fails", async () => {
            const mockElement = document.createElement("div");
            mockElement.setAttribute("data-cslp", "content_type.entry.field");

            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                mockElement;

            const mockExtractDetailsFromCslp = await import("../../../cslp");
            vi.mocked(
                mockExtractDetailsFromCslp.extractDetailsFromCslp
            ).mockReturnValue({
                content_type_uid: "test_content_type",
                entry_uid: "test_entry",
                locale: "en-us",
                fieldPath: "test_field",
                fieldPathWithIndex: "test_field",
            });

            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue(null);
            vi.mocked(getFieldData).mockResolvedValue(null);

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clear).toHaveBeenCalled();
        });

        it("should refresh iframe when clearing cache fails", async () => {
            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                null;
            VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                null;

            vi.mocked(FieldSchemaMap.clear).mockImplementation(() => {
                throw new Error("Cache clear failed");
            });

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clear).toHaveBeenCalled();
            expect(window.location.reload).toHaveBeenCalled();
        });

        it("should refresh iframe when any error occurs", async () => {
            const mockElement = document.createElement("div");
            mockElement.setAttribute("data-cslp", "content_type.entry.field");

            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                mockElement;

            const mockExtractDetailsFromCslp = await import("../../../cslp");
            vi.mocked(
                mockExtractDetailsFromCslp.extractDetailsFromCslp
            ).mockImplementation(() => {
                throw new Error("CSLP parsing failed");
            });

            await mockHandleRevalidateFieldData();

            expect(window.location.reload).toHaveBeenCalled();
        });

        it("should handle elements without data-cslp attribute", async () => {
            const mockElement = document.createElement("div");
            // No data-cslp attribute

            VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM =
                mockElement;

            // Reset the clear mock to not throw error for this test
            vi.mocked(FieldSchemaMap.clear).mockReset();
            vi.mocked(FieldSchemaMap.clear).mockImplementation(() => {
                // Successful clear - no error
            });

            await mockHandleRevalidateFieldData();

            expect(FieldSchemaMap.clear).toHaveBeenCalled();
            expect(window.location.reload).not.toHaveBeenCalled();
        });
    });
});
