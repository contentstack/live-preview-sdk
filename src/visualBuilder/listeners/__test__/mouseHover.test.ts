import { describe, it, expect, vi, beforeEach } from "vitest";
import handleMouseHover from "../mouseHover";
import { VisualBuilder } from "../../index";
import * as fetchEntryPermissionsModule from "../../utils/fetchEntryPermissionsAndStageDetails";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";

vi.mock("lodash-es", async () => ({
    ...(await import("lodash-es")),
    throttle: vi.fn((fn) => fn),
    debounce: vi.fn((fn) => fn),
}));

vi.mock("../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({
        acl: { update: { create: true, read: true, update: true, delete: true, publish: true } },
        workflowStage: { stage: undefined, permissions: { entry: { update: true } } },
        resolvedVariantPermissions: { update: true },
    }),
}));

vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockResolvedValue({ data_type: "text", field_metadata: {} }),
        hasFieldSchema: vi.fn().mockReturnValue(true),
        setFieldSchema: vi.fn(),
    },
}));

vi.mock("../../generators/generateCustomCursor", () => ({
    generateCustomCursor: vi.fn(),
}));

vi.mock("../../generators/generateHoverOutline.tsx", () => ({
    addHoverOutline: vi.fn(),
}));

vi.mock("../../utils/getCsDataOfElement", () => ({
    getCsDataOfElement: vi.fn(),
}));

vi.mock("../../utils/multipleElementAddButton", () => ({
    removeAddInstanceButtons: vi.fn(),
}));

vi.mock("../../generators/generateToolbar", () => ({
    appendFieldPathDropdown: vi.fn(),
}));

vi.mock("../../index", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: {
                previousSelectedEditableDOM: null,
                previousHoveredTargetDOM: null,
                isFocussed: false,
            },
        },
    },
}));

vi.mock("../../configManager/configManager", () => ({
    default: {
        get: vi.fn().mockReturnValue({
            collab: { enable: false, isFeedbackMode: false, pauseFeedback: false },
        }),
    },
}));

vi.mock("../../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn().mockReturnValue({}),
}));

vi.mock("../../generators/generateThread", () => ({
    isCollabThread: vi.fn().mockReturnValue(false),
}));

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

vi.mock("../../utils/getFieldType", () => ({
    getFieldType: vi.fn().mockReturnValue("singleline"),
}));

vi.mock("../../utils/isCustomFieldMultipleInstance", () => ({
    isCustomFieldMultipleInstance: vi.fn().mockReturnValue(false),
}));

const { getCsDataOfElement } = await import("../../utils/getCsDataOfElement");
const mockedGetCsDataOfElement = vi.mocked(getCsDataOfElement);
const mockedFetchEntryPermissions = vi.mocked(
    fetchEntryPermissionsModule.fetchEntryPermissionsAndStageDetails
);
const { addHoverOutline } = await import("../../generators/generateHoverOutline");
const { generateCustomCursor } = await import("../../generators/generateCustomCursor");
const { isCustomFieldMultipleInstance } = await import("../../utils/isCustomFieldMultipleInstance");

function makeElement(): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("data-cslp", "all_fields.entry1.en-us.title");
    document.body.appendChild(el);
    return el;
}

function makeEventDetails(editableElement: HTMLElement, cslpValue = "all_fields.entry1.en-us.title") {
    return {
        editableElement,
        fieldMetadata: {
            entry_uid: "entry1",
            content_type_uid: "all_fields",
            locale: "en-us",
            fieldPath: "title",
            fieldPathWithIndex: "title",
            cslpValue,
            variant: undefined,
        },
    };
}

function makeParams(editableElement: HTMLElement, customCursor: HTMLDivElement) {
    return {
        event: new MouseEvent("mousemove"),
        overlayWrapper: document.createElement("div"),
        visualBuilderContainer: document.createElement("div"),
        focusedToolbar: document.createElement("div"),
        resizeObserver: new ResizeObserver(() => {}),
        customCursor,
    };
}

describe("mouseHover — custom field multiple instance suppression", () => {
    let editableElement: HTMLElement;
    let customCursor: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
        editableElement = makeElement();
        customCursor = document.createElement("div");
        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;
        vi.mocked(FieldSchemaMap.hasFieldSchema).mockReturnValue(true);
    });

    it("dispatches mousemove on whole-field element for custom field multiple instance", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        editableElement.setAttribute("data-cslp", "all_fields.entry1.en-us.title.0");
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement, "all_fields.entry1.en-us.title.0") as any);

        // nest instance inside whole-field so closest() traversal finds the parent
        const wholeFieldEl = document.createElement("div");
        wholeFieldEl.setAttribute("data-cslp", "all_fields.entry1.en-us.title");
        wholeFieldEl.appendChild(editableElement);
        document.body.appendChild(wholeFieldEl);
        const dispatchSpy = vi.spyOn(wholeFieldEl, "dispatchEvent");

        await handleMouseHover(makeParams(editableElement, customCursor));

        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
        expect(addHoverOutline).not.toHaveBeenCalled();
    });

    it("resets cursor when whole-field element not found in DOM", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        editableElement.setAttribute("data-cslp", "all_fields.entry1.en-us.title.0");
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement, "all_fields.entry1.en-us.title.0") as any);
        // no whole-field ancestor in DOM — closest() returns null

        await handleMouseHover(makeParams(editableElement, customCursor));

        expect(addHoverOutline).not.toHaveBeenCalled();
        expect(vi.mocked(generateCustomCursor)).toHaveBeenCalledWith(
            expect.objectContaining({ fieldType: "empty" })
        );
    });

    it("shows outline normally when isCustomFieldMultipleInstance returns false", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(false);
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement) as any);

        await handleMouseHover(makeParams(editableElement, customCursor));

        expect(addHoverOutline).toHaveBeenCalled();
    });

    it("does not suppress when schema is not yet cached (hasFieldSchema returns false)", async () => {
        vi.mocked(FieldSchemaMap.hasFieldSchema).mockReturnValue(false);
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement) as any);

        await handleMouseHover(makeParams(editableElement, customCursor));

        expect(isCustomFieldMultipleInstance).not.toHaveBeenCalled();
        expect(addHoverOutline).toHaveBeenCalled();
    });
});

describe("mouseHover — generateCursor same-element guard", () => {
    let editableElement: HTMLElement;
    let customCursor: HTMLDivElement;

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";

        editableElement = makeElement();
        customCursor = document.createElement("div");

        VisualBuilder.VisualBuilderGlobalState.value.previousHoveredTargetDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;
    });

    // On a new element, both generateCursor and addOutline call fetchEntryPermissionsAndStageDetails
    // — so the delta per first-hover is 2.
    it("calls fetchEntryPermissionsAndStageDetails from both generateCursor and addOutline on new element hover", async () => {
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement) as any);

        const before = mockedFetchEntryPermissions.mock.calls.length;
        await handleMouseHover(makeParams(editableElement, customCursor));
        const delta = mockedFetchEntryPermissions.mock.calls.length - before;

        // generateCursor (1) + addOutline (1) = 2
        expect(delta).toBe(2);
    });

    // On the same element, the guard skips generateCursor — only addOutline fires.
    // Delta drops from 2 to 1, proving the guard is active.
    it("skips generateCursor (reduces call delta to 1) when hovering the same element again", async () => {
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement) as any);

        // First hover over new element — delta = 2 (generateCursor + addOutline)
        await handleMouseHover(makeParams(editableElement, customCursor));

        const afterFirst = mockedFetchEntryPermissions.mock.calls.length;

        // Second hover over the SAME element — generateCursor is guarded, only addOutline fires
        await handleMouseHover(makeParams(editableElement, customCursor));

        const secondDelta = mockedFetchEntryPermissions.mock.calls.length - afterFirst;
        expect(secondDelta).toBe(1);
    });

    // Moving to a different element resets the guard — both generateCursor and addOutline fire again.
    it("calls both generateCursor and addOutline (delta = 2) when hovering a different element", async () => {
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(editableElement) as any);
        await handleMouseHover(makeParams(editableElement, customCursor));

        const secondElement = makeElement();
        mockedGetCsDataOfElement.mockReturnValue(makeEventDetails(secondElement) as any);

        const before = mockedFetchEntryPermissions.mock.calls.length;
        await handleMouseHover(makeParams(secondElement, customCursor));
        const delta = mockedFetchEntryPermissions.mock.calls.length - before;

        expect(delta).toBe(2);
    });
});
