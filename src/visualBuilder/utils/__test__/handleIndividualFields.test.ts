import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { handleIndividualFields, cleanIndividualFieldResidual } from "../handleIndividualFields";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { FieldSchemaMap } from "../fieldSchemaMap";
import { getFieldData } from "../getFieldData";
import { getFieldType } from "../getFieldType";
import { isFieldDisabled } from "../isFieldDisabled";
import { handleAddButtonsForMultiple, removeAddInstanceButtons } from "../multipleElementAddButton";
import { VisualBuilderPostMessageEvents } from "../types/postMessage.types";
import visualBuilderPostMessage from "../visualBuilderPostMessage";
import { VisualBuilder } from "../..";
import { act } from "@testing-library/preact";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../constants";
import { FieldDataType } from "../types/index.types";

vi.mock("../fieldSchemaMap");
vi.mock("../getFieldData");
vi.mock("../getFieldType");
vi.mock("../isFieldDisabled");
vi.mock("../multipleElementAddButton");
vi.mock("../updateFocussedState");
vi.mock("../visualBuilderPostMessage");

describe("handleIndividualFields", () => {
    let eventDetails: VisualBuilderCslpEventDetails;
    let elements: {
        visualBuilderContainer: HTMLDivElement;
        resizeObserver: ResizeObserver;
        lastEditedField: Element | null;
    };

    beforeEach(() => {
        eventDetails = {
            // @ts-expect-error mocking only required properties
            fieldMetadata: {
                content_type_uid: "contentTypeUid",
                entry_uid: "entryUid",
                locale: "en-us",
                fieldPath: "fieldPath",
                fieldPathWithIndex: "fieldPathWithIndex",
                instance: {
                    fieldPathWithIndex: "fieldPathWithIndex.0"
                }
            },
            editableElement: document.createElement("div")
        };

        elements = {
            visualBuilderContainer: document.createElement("div"),
            resizeObserver: new ResizeObserver(() => {}),
            lastEditedField: null
        };

        vi.clearAllMocks();
    });

    it("should handle individual fields correctly", async () => {
        const fieldSchema = { data_type: "text", multiple: false };
        const expectedFieldData = "expectedFieldData";
        const fieldType = "text";
        const isDisabled = { isDisabled: false };

        (FieldSchemaMap.getFieldSchema as Mock).mockResolvedValue(fieldSchema);
        (getFieldData as Mock).mockResolvedValue(expectedFieldData);
        (getFieldType as Mock).mockReturnValue(fieldType);
        (isFieldDisabled as Mock).mockReturnValue(isDisabled);

        await act(async () => {
            await handleIndividualFields(eventDetails, elements);
        });

        expect(FieldSchemaMap.getFieldSchema).toHaveBeenCalledWith("contentTypeUid", "fieldPath");
        expect(getFieldData).toHaveBeenCalledWith({ content_type_uid: "contentTypeUid", entry_uid: "entryUid", locale: "en-us" }, "fieldPathWithIndex");
        expect(getFieldType).toHaveBeenCalledWith(fieldSchema);
        expect(isFieldDisabled).toHaveBeenCalledWith(
          fieldSchema, 
          eventDetails,
          {
            update: true,
          },
          {
            read: true,
            update: true,
            delete: true,
            publish: true,
          },
          {
            permissions: {
                entry: {
                    update: true,
                },
            },
            stage: {
                name: "Unknown"
            }
          }
        );
        expect(eventDetails.editableElement.getAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY)).toBe(fieldType);
    });

    it("should handle multiple fields correctly", async () => {
        const fieldSchema = { data_type: "blocks", multiple: true };
        const expectedFieldData = ["data1", "data2"];
        const fieldType = "blocks";
        const isDisabled = { isDisabled: false };

        (FieldSchemaMap.getFieldSchema as Mock).mockResolvedValue(fieldSchema);
        (getFieldData as Mock).mockResolvedValue(expectedFieldData);
        (getFieldType as Mock).mockReturnValue(fieldType);
        (isFieldDisabled as Mock).mockReturnValue(isDisabled);

        await handleIndividualFields(eventDetails, elements);

        expect(handleAddButtonsForMultiple).toHaveBeenCalled();
    });

    it("should handle inline editing for supported fields", async () => {
        const fieldSchema = { data_type: FieldDataType.SINGLELINE, multiple: false };
        const expectedFieldData = "expectedFieldData";
        eventDetails.editableElement.textContent = expectedFieldData;
        const fieldType = FieldDataType.SINGLELINE;
        const isDisabled = { isDisabled: false };

        (FieldSchemaMap.getFieldSchema as Mock).mockResolvedValue(fieldSchema);
        (getFieldData as Mock).mockResolvedValue(expectedFieldData);
        (getFieldType as Mock).mockReturnValue(fieldType);
        (isFieldDisabled as Mock).mockReturnValue(isDisabled);

        await act(async () => {
            await handleIndividualFields(eventDetails, elements);
        })

        expect(eventDetails.editableElement.getAttribute(VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY)).toBe(fieldType);
        expect(eventDetails.editableElement.getAttribute("contenteditable")).toBe("true");
    });

});

describe("cleanIndividualFieldResidual", () => {
    let elements: {
        overlayWrapper: HTMLDivElement;
        visualBuilderContainer: HTMLDivElement | null;
        focusedToolbar: HTMLDivElement | null;
        resizeObserver: ResizeObserver;
    };

    beforeEach(() => {
        elements = {
            overlayWrapper: document.createElement("div"),
            visualBuilderContainer: document.createElement("div"),
            focusedToolbar: document.createElement("div"),
            resizeObserver: new ResizeObserver(() => {})
        };

        vi.clearAllMocks();
    });

    it("should clean individual field residuals correctly", () => {
        const previousSelectedEditableDOM = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM = previousSelectedEditableDOM;

        cleanIndividualFieldResidual(elements);

        expect(removeAddInstanceButtons).toHaveBeenCalled();
        expect(previousSelectedEditableDOM.getAttribute("contenteditable")).toBeNull();
        expect(elements.resizeObserver.unobserve).toHaveBeenCalledWith(previousSelectedEditableDOM);
    });

    it("should clean pseudo editable element correctly", () => {
        const pseudoEditableElement = document.createElement("div");
        pseudoEditableElement.classList.add("visual-builder__pseudo-editable-element");
        elements.visualBuilderContainer?.appendChild(pseudoEditableElement);

        cleanIndividualFieldResidual(elements);

        expect(elements.resizeObserver.unobserve).toHaveBeenCalledWith(pseudoEditableElement);
        expect(pseudoEditableElement.parentNode).toBeNull();
    });
it("should clean focused toolbar correctly", () => {
    cleanIndividualFieldResidual(elements);

    expect(elements.focusedToolbar?.innerHTML).toBe("");

    const toolbarEvents = [VisualBuilderPostMessageEvents.DELETE_INSTANCE, VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID];
    toolbarEvents.forEach((event) => {
        //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
        if (visualBuilderPostMessage?.requestMessageHandlers?.has(event)) {
            //@ts-expect-error - We are accessing private method here, but it is necessary to clean up the event listeners.
            expect(visualBuilderPostMessage?.unregisterEvent).toHaveBeenCalledWith(event);
        }
    });
});
});