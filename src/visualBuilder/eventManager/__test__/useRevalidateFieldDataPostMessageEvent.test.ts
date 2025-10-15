import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
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

vi.mock("../../generators/generateOverlay", () => ({
    hideFocusOverlay: vi.fn(),
}));

vi.mock("../../listeners/mouseClick", () => ({
    handleBuilderInteraction: vi.fn(),
}));

// Mock window.location.reload
Object.defineProperty(window, "location", {
    value: {
        reload: vi.fn(),
    },
    writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((cb) => {
    cb(0);
    return 0;
});

describe("useRevalidateFieldDataPostMessageEvent", () => {
    let visualBuilderContainer: HTMLDivElement;
    let overlayWrapper: HTMLDivElement;
    let focusedToolbar: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();

        // Create DOM elements
        visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add("visual-builder__container");
        overlayWrapper = document.createElement("div");
        overlayWrapper.classList.add("visual-builder__overlay__wrapper");
        focusedToolbar = document.createElement("div");
        focusedToolbar.classList.add("visual-builder__focused-toolbar");

        document.body.appendChild(visualBuilderContainer);
        document.body.appendChild(overlayWrapper);
        document.body.appendChild(focusedToolbar);

        // Reset VisualBuilder global state
        VisualBuilder.VisualBuilderGlobalState = {
            // @ts-expect-error mocking only required properties
            value: {
                previousHoveredTargetDOM: null,
                previousSelectedEditableDOM: null,
                isFocussed: false,
            },
        };
    });

    afterEach(() => {
        document.body.innerHTML = "";
    });

    it("should register post message event listener", () => {
        useRevalidateFieldDataPostMessageEvent();

        expect(visualBuilderPostMessage?.on).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.REVALIDATE_FIELD_DATA,
            expect.any(Function)
        );
    });

    describe("handleRevalidateFieldData", () => {
        let mockHandleRevalidateFieldData: any;

        beforeEach(() => {
            useRevalidateFieldDataPostMessageEvent();
            mockHandleRevalidateFieldData = (
                visualBuilderPostMessage?.on as any
            ).mock.calls[0][1];
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
            } as any);

            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                test: "schema",
            } as any);
            vi.mocked(getFieldData).mockResolvedValue({ test: "data" } as any);

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
            } as any);

            vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                test: "schema",
            } as any);
            vi.mocked(getFieldData).mockResolvedValue({ test: "data" } as any);

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
            } as any);

            (vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue as any)(
                null
            );
            (vi.mocked(getFieldData).mockResolvedValue as any)(null);

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

        describe("unfocus and refocus behavior", () => {
            let hideFocusOverlay: any;
            let handleBuilderInteraction: any;

            beforeEach(async () => {
                const overlayModule = await import(
                    "../../generators/generateOverlay"
                );
                const mouseClickModule = await import(
                    "../../listeners/mouseClick"
                );
                hideFocusOverlay = vi.mocked(overlayModule.hideFocusOverlay);
                handleBuilderInteraction = vi.mocked(
                    mouseClickModule.handleBuilderInteraction
                );
            });

            it("should unfocus element before revalidation when focused element exists", async () => {
                const mockElement = document.createElement("div");
                mockElement.setAttribute(
                    "data-cslp",
                    "content_type.entry.field"
                );
                mockElement.setAttribute("data-cslp-unique-id", "unique-123");

                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    mockElement;
                VisualBuilder.VisualBuilderGlobalState.value.isFocussed = true;

                const mockExtractDetailsFromCslp = await import(
                    "../../../cslp"
                );
                vi.mocked(
                    mockExtractDetailsFromCslp.extractDetailsFromCslp
                ).mockReturnValue({
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                    fieldPathWithIndex: "test_field",
                } as any);

                vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                    test: "schema",
                } as any);
                vi.mocked(getFieldData).mockResolvedValue({
                    test: "data",
                } as any);

                await mockHandleRevalidateFieldData();

                // Should call hideFocusOverlay to unfocus
                expect(hideFocusOverlay).toHaveBeenCalledWith(
                    expect.objectContaining({
                        visualBuilderContainer: expect.any(HTMLDivElement),
                        visualBuilderOverlayWrapper: expect.any(HTMLDivElement),
                        focusedToolbar: expect.any(HTMLDivElement),
                        noTrigger: true,
                    })
                );

                // Should clear global state
                expect(
                    VisualBuilder.VisualBuilderGlobalState.value
                        .previousSelectedEditableDOM
                ).toBeNull();
                expect(
                    VisualBuilder.VisualBuilderGlobalState.value.isFocussed
                ).toBe(false);
            });

            it("should refocus element after revalidation completes", async () => {
                const mockElement = document.createElement("div");
                mockElement.setAttribute(
                    "data-cslp",
                    "content_type.entry.field"
                );
                mockElement.setAttribute("data-cslp-unique-id", "unique-123");
                document.body.appendChild(mockElement);

                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    mockElement;

                const mockExtractDetailsFromCslp = await import(
                    "../../../cslp"
                );
                vi.mocked(
                    mockExtractDetailsFromCslp.extractDetailsFromCslp
                ).mockReturnValue({
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                    fieldPathWithIndex: "test_field",
                } as any);

                vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                    test: "schema",
                } as any);
                vi.mocked(getFieldData).mockResolvedValue({
                    test: "data",
                } as any);

                await mockHandleRevalidateFieldData();

                // Should refocus the element using unique ID
                expect(handleBuilderInteraction).toHaveBeenCalledWith(
                    expect.objectContaining({
                        event: expect.any(MouseEvent),
                        previousSelectedEditableDOM: null,
                        visualBuilderContainer: expect.any(HTMLDivElement),
                        overlayWrapper: expect.any(HTMLDivElement),
                    })
                );

                document.body.removeChild(mockElement);
            });

            it("should refocus using data-cslp when unique ID is not available", async () => {
                const mockElement = document.createElement("div");
                mockElement.setAttribute(
                    "data-cslp",
                    "content_type.entry.field"
                );
                // No unique ID
                document.body.appendChild(mockElement);

                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    mockElement;

                const mockExtractDetailsFromCslp = await import(
                    "../../../cslp"
                );
                vi.mocked(
                    mockExtractDetailsFromCslp.extractDetailsFromCslp
                ).mockReturnValue({
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                    fieldPathWithIndex: "test_field",
                } as any);

                vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                    test: "schema",
                } as any);
                vi.mocked(getFieldData).mockResolvedValue({
                    test: "data",
                } as any);

                await mockHandleRevalidateFieldData();

                // Should still call handleBuilderInteraction
                expect(handleBuilderInteraction).toHaveBeenCalled();

                document.body.removeChild(mockElement);
            });

            it("should not refocus if element cannot be found after revalidation", async () => {
                const mockElement = document.createElement("div");
                mockElement.setAttribute(
                    "data-cslp",
                    "content_type.entry.field"
                );
                // Don't append to DOM - element won't be found

                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    mockElement;

                const mockExtractDetailsFromCslp = await import(
                    "../../../cslp"
                );
                vi.mocked(
                    mockExtractDetailsFromCslp.extractDetailsFromCslp
                ).mockReturnValue({
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                    fieldPathWithIndex: "test_field",
                } as any);

                vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                    test: "schema",
                } as any);
                vi.mocked(getFieldData).mockResolvedValue({
                    test: "data",
                } as any);

                await mockHandleRevalidateFieldData();

                // Should not call handleBuilderInteraction if element not found
                expect(handleBuilderInteraction).not.toHaveBeenCalled();
            });

            it("should not unfocus or refocus when no element is focused", async () => {
                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    null;

                await mockHandleRevalidateFieldData();

                // Should not call unfocus/refocus functions
                expect(hideFocusOverlay).not.toHaveBeenCalled();
                expect(handleBuilderInteraction).not.toHaveBeenCalled();

                // Should still clear cache
                expect(FieldSchemaMap.clear).toHaveBeenCalled();
            });

            it("should handle refocus errors gracefully", async () => {
                const mockElement = document.createElement("div");
                mockElement.setAttribute(
                    "data-cslp",
                    "content_type.entry.field"
                );
                document.body.appendChild(mockElement);

                VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
                    mockElement;

                const mockExtractDetailsFromCslp = await import(
                    "../../../cslp"
                );
                vi.mocked(
                    mockExtractDetailsFromCslp.extractDetailsFromCslp
                ).mockReturnValue({
                    content_type_uid: "test_content_type",
                    entry_uid: "test_entry",
                    locale: "en-us",
                    fieldPath: "test_field",
                    fieldPathWithIndex: "test_field",
                } as any);

                vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
                    test: "schema",
                } as any);
                vi.mocked(getFieldData).mockResolvedValue({
                    test: "data",
                } as any);

                // Make handleBuilderInteraction throw an error
                handleBuilderInteraction.mockRejectedValueOnce(
                    new Error("Refocus failed")
                );

                // Should not throw - error should be caught and logged
                await expect(
                    mockHandleRevalidateFieldData()
                ).resolves.not.toThrow();

                document.body.removeChild(mockElement);
            });
        });
    });
});
