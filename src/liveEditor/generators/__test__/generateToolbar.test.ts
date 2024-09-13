import { fireEvent } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../__test__/data/fieldSchemaMap";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import { appendFieldPathDropdown } from "../generateToolbar";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

describe("appendFieldPathDropdown", () => {
    let singleLineField: HTMLParagraphElement;
    let focusedToolbar: HTMLDivElement;
    let mockFieldMetadata: CslpData;
    let mockEventDetails: VisualEditorCslpEventDetails;

    beforeEach(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );

        singleLineField = document.createElement("p");
        singleLineField.setAttribute(
            "data-cslp",
            "all_fields.bltapikey.en-us.single_line"
        );
        document.body.appendChild(singleLineField);

        focusedToolbar = document.createElement("div");
        focusedToolbar.classList.add("visual-builder__focused-toolbar");
        focusedToolbar.setAttribute(
            "data-testid",
            "visual-builder__focused-toolbar"
        );

        mockFieldMetadata = {
            entry_uid: "",
            content_type_uid: "mockContentTypeUid",
            cslpValue: "",
            locale: "",
            fieldPath: "mockFieldPath",
            fieldPathWithIndex: "",
            multipleFieldMetadata: {
                index: 0,
                parentDetails: {
                    parentPath: "",
                    parentCslpValue: "",
                },
            },
            instance: {
                fieldPathWithIndex: "",
            },
        };

        mockEventDetails = {
            editableElement: document.createElement("div"),
            cslpData: "",
            fieldMetadata: mockFieldMetadata,
        };
    });

    test("should not do anything if tooltip is already present", () => {
        focusedToolbar.classList.add("visual-builder__tooltip");

        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            ".visual-builder__focused-toolbar__field-label-wrapper"
        );
        fireEvent.click(focusedToolbar);

        expect(
            fieldLabelWrapper?.classList.contains(
                "visual-builder__focused-toolbar__field-label-wrapper"
            )
        ).toBeTruthy();
    });

    test("should click the closest parent if focused toolbar is a parent field", () => {
        focusedToolbar.classList.add(
            "visual-builder__focused-toolbar__field-label-wrapper__parent-field"
        );
        focusedToolbar.setAttribute("data-target-cslp", "test-cslp");

        const parentElement = document.createElement("div");
        parentElement.classList.add("test-parent");
        parentElement.setAttribute("data-cslp", "test-cslp");

        const targetElement = document.createElement("div");
        parentElement.setAttribute("data-target-cslp", "test-cslp");
        parentElement.appendChild(targetElement);

        mockEventDetails.editableElement = parentElement;

        const mockOnClick = vi.fn();
        parentElement.click = mockOnClick;

        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            ".visual-builder__focused-toolbar__field-label-wrapper"
        );

        fireEvent.click(focusedToolbar);

        expect(fieldLabelWrapper?.classList.toString()).toBe(
            "visual-builder__focused-toolbar__field-label-wrapper"
        );

        expect(mockOnClick).toBeCalled();
    });

    test("should close the field label dropdown if open", () => {
        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            ".visual-builder__focused-toolbar__field-label-wrapper"
        );

        fieldLabelWrapper?.classList.add("field-label-dropdown-open");

        fireEvent.click(focusedToolbar);

        expect(fieldLabelWrapper?.classList.toString()).toBe(
            "visual-builder__focused-toolbar__field-label-wrapper"
        );
    });

    test("should open the field label dropdown if closed", () => {
        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            ".visual-builder__focused-toolbar__field-label-wrapper"
        );

        expect(
            fieldLabelWrapper?.classList.contains(
                "visual-builder__focused-toolbar__field-label-wrapper"
            )
        ).toBeTruthy();

        fireEvent.click(focusedToolbar);

        expect(fieldLabelWrapper?.classList.toString()).toBe(
            "visual-builder__focused-toolbar__field-label-wrapper go3399023040"
        );
    });
});
