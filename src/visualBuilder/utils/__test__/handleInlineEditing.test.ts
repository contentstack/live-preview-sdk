import { handleInlineEditableField } from "../handleInlineEditableField";
import { FieldDataType } from "../types/index.types";

// Mock dependencies
const mockEnableInlineEditing = vi.fn();
vi.mock("../enableInlineEditing", () => ({
    enableInlineEditing: (params: any) => mockEnableInlineEditing(params),
}));

vi.mock("../isFieldMultiple", () => ({
    isFieldMultiple: (schema: any) => schema.multiple === true,
}));

describe("handleInlineEditing", () => {
    beforeEach(() => {
        mockEnableInlineEditing.mockClear();
    });

    const mockElements = {}; // Mock VisualBuilderElements
    const mockEditableElement = document.createElement("div");

    test("should return early if field type is not allowed for inline editing", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.JSON_RTE,
            fieldSchema: {},
            fieldMetadata: { instance: { fieldPathWithIndex: "field.0" } },
            expectedFieldData: "test",
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).not.toHaveBeenCalled();
    });

    test("should handle multiple field with valid instance index", () => {
        const fieldData = ["value1", "value2", "value3"];

        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: true },
            fieldMetadata: { instance: { fieldPathWithIndex: "field.1" } },
            expectedFieldData: fieldData,
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).toHaveBeenCalledWith({
            fieldType: FieldDataType.SINGLELINE,
            expectedFieldData: "value2",
            editableElement: mockEditableElement,
            elements: mockElements,
        });
    });

    test("should not enable inline editing for a multiple field parent (not an instance)", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: true },
            fieldMetadata: { instance: { fieldPathWithIndex: "field" } }, // No index
            expectedFieldData: ["value1", "value2"],
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).not.toHaveBeenCalled();
    });

    test("should handle multiple field's instance value", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: true },
            fieldMetadata: { instance: { fieldPathWithIndex: "field.0" } },
            expectedFieldData: "singleValue", // Not an array
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).toHaveBeenCalledWith({
            fieldType: FieldDataType.SINGLELINE,
            expectedFieldData: "singleValue",
            editableElement: mockEditableElement,
            elements: mockElements,
        });
    });

    test("should handle single field", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: false },
            fieldMetadata: { instance: { fieldPathWithIndex: "field" } },
            expectedFieldData: "singleValue",
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).toHaveBeenCalledWith({
            fieldType: FieldDataType.SINGLELINE,
            expectedFieldData: "singleValue",
            editableElement: mockEditableElement,
            elements: mockElements,
        });
    });

    test("should handle single field with array data (ContentType change from multiple to single)", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: false },
            fieldMetadata: { instance: { fieldPathWithIndex: "field.0" } }, // Has index 0
            expectedFieldData: ["value1", "value2"],
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).toHaveBeenCalledWith({
            fieldType: FieldDataType.SINGLELINE,
            expectedFieldData: "value1",
            editableElement: mockEditableElement,
            elements: mockElements,
        });
    });

    test("should not process single field with non-zero index (invalid case)", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: false },
            fieldMetadata: { instance: { fieldPathWithIndex: "field.1" } }, // Non-zero index
            expectedFieldData: ["value1", "value2"],
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).not.toHaveBeenCalled();
    });

    test("should handle single field with single value", () => {
        handleInlineEditableField({
            fieldType: FieldDataType.SINGLELINE,
            fieldSchema: { multiple: false },
            fieldMetadata: { instance: { fieldPathWithIndex: "field" } },
            expectedFieldData: "singleValue",
            editableElement: mockEditableElement,
            // @ts-expect-error mocking only required properties
            elements: mockElements,
        });

        expect(mockEnableInlineEditing).toHaveBeenCalledWith({
            fieldType: FieldDataType.SINGLELINE,
            expectedFieldData: "singleValue",
            editableElement: mockEditableElement,
            elements: mockElements,
        });
    });
});
