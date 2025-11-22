import { act, fireEvent } from "@testing-library/preact";
import { getFieldSchemaMap } from "../../../__test__/data/fieldSchemaMap";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import { appendFieldPathDropdown } from "../generateToolbar";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";

const MOCK_CSLP = "all_fields.bltapikey.en-us.single_line";

// Vitest 4: Use class-based mocks for constructors
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
    constructor(_callback: ResizeObserverCallback) {}
} as any;

vi.mock("../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: async () => ({
        acl: {
            update: {
                create: true,
                read: true,
                update: true,
                delete: true,
                publish: true,
            },
        },
        workflowStage: {
            stage: undefined,
            permissions: {
                entry: {
                    update: true,
                },
            },
        },
    }),
}));

describe("appendFieldPathDropdown", () => {
    let singleLineField: HTMLParagraphElement;
    let focusedToolbar: HTMLDivElement;
    let mockFieldMetadata: CslpData;
    let mockEventDetails: VisualBuilderCslpEventDetails;

    beforeAll(() => {
        if (!visualBuilderPostMessage) {
            return;
        }
        vi.spyOn(visualBuilderPostMessage, "send").mockImplementation(
            (eventName: string, args) => {
                if (
                    eventName ===
                    VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                ) {
                    return Promise.resolve({
                        [MOCK_CSLP]: "Single Line",
                    });
                }
                return Promise.resolve({});
            }
        );
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockImplementation(() => {
            return Promise.resolve(singleLineFieldSchema);
        });
    });

    beforeAll(() => {
        FieldSchemaMap.setFieldSchema(
            "all_fields",
            getFieldSchemaMap().all_fields
        );
    });

    beforeEach(() => {
        document.body.innerHTML = "";

        singleLineField = document.createElement("p");
        singleLineField.setAttribute("data-cslp", MOCK_CSLP);
        document.body.appendChild(singleLineField);

        focusedToolbar = document.createElement("div");
        focusedToolbar.classList.add("visual-builder__focused-toolbar");
        focusedToolbar.setAttribute(
            "data-testid",
            "visual-builder__focused-toolbar"
        );

        /** @ts-expect-error - variant is an optional field */
        mockFieldMetadata = {
            entry_uid: "",
            content_type_uid: "mockContentTypeUid",
            cslpValue: MOCK_CSLP,
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
        focusedToolbar.classList.add("visual-builder__tooltip--persistent");
        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            ".visual-builder__focused-toolbar__field-label-wrapper"
        );
        fireEvent.click(focusedToolbar);

        expect(fieldLabelWrapper).toHaveClass(
            "visual-builder__focused-toolbar__field-label-wrapper"
        );
    });

    test("should close the field label dropdown if open", () => {
        appendFieldPathDropdown(mockEventDetails, focusedToolbar);

        const fieldLabelWrapper = focusedToolbar.querySelector(
            '[data-testid="visual-builder__focused-toolbar__field-label-wrapper"]'
        ) as HTMLElement;

        expect(fieldLabelWrapper).toBeTruthy();
        fireEvent.click(fieldLabelWrapper);

        expect(fieldLabelWrapper).toHaveClass("field-label-dropdown-open");
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
        ).toBe(true);

        fireEvent.click(focusedToolbar);

        expect(fieldLabelWrapper?.classList.toString()).toBe(
            "visual-builder__focused-toolbar__field-label-wrapper go3061601331"
        );
    });
});
