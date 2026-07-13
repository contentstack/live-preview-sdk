import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import handleBuilderInteraction from "../mouseClick";
import { VisualBuilder } from "../../index";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";

vi.mock("../../utils/handleIndividualFields", () => ({
    handleIndividualFields: vi.fn().mockResolvedValue(undefined),
    cleanIndividualFieldResidual: vi.fn(),
}));

vi.mock("../../utils/getCsDataOfElement", () => ({
    getCsDataOfElement: vi.fn(),
    getDOMEditStack: vi.fn().mockReturnValue([]),
}));

vi.mock("../../cslp", () => ({
    isValidCslp: vi.fn().mockReturnValue(false),
}));

vi.mock("../../generators/generateToolbar", () => ({
    appendFocusedToolbar: vi.fn(),
    removeFieldToolbar: vi.fn(),
}));

vi.mock("../../generators/generateOverlay", () => ({
    addFocusOverlay: vi.fn(),
    hideOverlay: vi.fn(),
}));

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: { send: vi.fn().mockResolvedValue(undefined) },
}));

vi.mock("../../utils/types/postMessage.types", () => ({
    VisualBuilderPostMessageEvents: { MOUSE_CLICK: "MOUSE_CLICK", FOCUS_FIELD: "FOCUS_FIELD" },
}));

vi.mock("../../index", () => ({
    VisualBuilder: {
        VisualBuilderGlobalState: {
            value: {
                previousSelectedEditableDOM: null,
                previousHoveredTargetDOM: null,
                isFocussed: false,
                focusElementObserver: null,
            },
        },
    },
}));

vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockResolvedValue({ data_type: "text", field_metadata: {} }),
        hasFieldSchema: vi.fn().mockReturnValue(true),
    },
}));

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

vi.mock("../../generators/generateHighlightedComment", () => ({
    toggleHighlightedCommentIconDisplay: vi.fn(),
}));

vi.mock("../../..", () => ({
    VB_EmptyBlockParentClass: "vb-empty-block-parent",
}));

vi.mock("../../components/FieldRevert/FieldRevertComponent", () => ({
    getFieldVariantStatus: vi.fn().mockResolvedValue(null),
}));

vi.mock("get-xpath", () => ({ default: vi.fn().mockReturnValue("/div") }));

const hoistedConfigMocks = vi.hoisted(() => ({
    configGet: vi.fn().mockReturnValue({
        collab: { enable: false, isFeedbackMode: false, pauseFeedback: false },
    }),
}));

vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: hoistedConfigMocks.configGet,
        set: vi.fn(),
    },
}));

vi.mock("../../generators/generateThread", () => ({
    generateThread: vi.fn(),
    isCollabThread: vi.fn().mockReturnValue(false),
    toggleCollabPopup: vi.fn(),
}));

vi.mock("../../utils/collabUtils", () => ({
    fixSvgXPath: vi.fn((x) => x),
}));

vi.mock("uuid", () => ({ v4: vi.fn().mockReturnValue("test-uuid") }));

vi.mock("../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({
        acl: { update: { create: true, read: true, update: true, delete: true, publish: true } },
        workflowStage: { stage: undefined, permissions: { entry: { update: true } } },
        resolvedVariantPermissions: { update: true },
    }),
}));

vi.mock("../../utils/isCustomFieldMultipleInstance", () => ({
    isCustomFieldMultipleInstance: vi.fn().mockReturnValue(false),
}));

const { getCsDataOfElement } = await import("../../utils/getCsDataOfElement");
const { addFocusOverlay } = await import("../../generators/generateOverlay");
const { handleIndividualFields } = await import("../../utils/handleIndividualFields");
const { isCustomFieldMultipleInstance } = await import("../../utils/isCustomFieldMultipleInstance");
const { generateThread, toggleCollabPopup } = await import("../../generators/generateThread");

function makeEditableElement(): HTMLElement {
    const el = document.createElement("div");
    el.setAttribute("data-cslp", "ct.entry1.en-us.field.0");
    document.body.appendChild(el);
    return el;
}

function makeEventDetails(editableElement: HTMLElement) {
    return {
        editableElement,
        fieldMetadata: {
            entry_uid: "entry1",
            content_type_uid: "ct",
            locale: "en-us",
            fieldPath: "field",
            fieldPathWithIndex: "field.0",
            cslpValue: "ct.entry1.en-us.field.0",
            variant: undefined,
            instance: { fieldPathWithIndex: "field.0" },
            multipleFieldMetadata: { index: 0, parentDetails: null },
        },
    };
}

function makeParams(editableElement: HTMLElement) {
    const event = new MouseEvent("click") as MouseEvent & { altKey: boolean };
    Object.defineProperty(event, "target", { value: editableElement, writable: false });
    return {
        event,
        overlayWrapper: document.createElement("div"),
        visualBuilderContainer: document.createElement("div"),
        focusedToolbar: document.createElement("div"),
        resizeObserver: new ResizeObserver(() => {}),
    };
}

describe("handleBuilderInteraction — custom field multiple instance suppression", () => {
    let editableElement: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
        editableElement = makeEditableElement();
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;
        vi.mocked(FieldSchemaMap.hasFieldSchema).mockReturnValue(true);
        vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({ data_type: "text", field_metadata: {} } as any);
    });

    it("redirects click to whole-field parent for custom field multiple instance", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        vi.mocked(getCsDataOfElement).mockReturnValue(makeEventDetails(editableElement) as any);

        // nest instance inside whole-field so closest() traversal finds the parent
        const wholeFieldEl = document.createElement("div");
        wholeFieldEl.setAttribute("data-cslp", "ct.entry1.en-us.field");
        wholeFieldEl.appendChild(editableElement);
        document.body.appendChild(wholeFieldEl);

        const dispatchSpy = vi.spyOn(wholeFieldEl, "dispatchEvent");

        await handleBuilderInteraction(makeParams(editableElement));

        expect(dispatchSpy).toHaveBeenCalledWith(expect.any(MouseEvent));
        expect(addFocusOverlay).not.toHaveBeenCalled();
        expect(VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM).toBeNull();
    });

    it("returns early without redirect when whole-field element not found in DOM", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        vi.mocked(getCsDataOfElement).mockReturnValue(makeEventDetails(editableElement) as any);
        // no whole-field element in DOM

        await handleBuilderInteraction(makeParams(editableElement));

        expect(addFocusOverlay).not.toHaveBeenCalled();
        expect(VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM).toBeNull();
    });

    it("proceeds normally for whole custom field (isCustomFieldMultipleInstance returns false)", async () => {
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(false);
        vi.mocked(getCsDataOfElement).mockReturnValue(makeEventDetails(editableElement) as any);

        await handleBuilderInteraction(makeParams(editableElement));

        expect(addFocusOverlay).toHaveBeenCalled();
    });

    it("does not suppress when schema not yet cached (hasFieldSchema returns false)", async () => {
        vi.mocked(FieldSchemaMap.hasFieldSchema).mockReturnValue(false);
        vi.mocked(isCustomFieldMultipleInstance).mockReturnValue(true);
        vi.mocked(getCsDataOfElement).mockReturnValue(makeEventDetails(editableElement) as any);

        await handleBuilderInteraction(makeParams(editableElement));

        expect(isCustomFieldMultipleInstance).not.toHaveBeenCalled();
        expect(addFocusOverlay).toHaveBeenCalled();
    });
});

describe("handleBuilderInteraction — pauseFeedback guard", () => {
    let editableElement: HTMLElement;

    beforeEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = "";
        editableElement = makeEditableElement();
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM = null;
        VisualBuilder.VisualBuilderGlobalState.value.isFocussed = false;
    });

    it("should return early without processing click when collab is enabled and pauseFeedback is true", async () => {
        hoistedConfigMocks.configGet.mockReturnValue({
            collab: { enable: true, pauseFeedback: true, isFeedbackMode: true },
        });

        await handleBuilderInteraction(makeParams(editableElement));

        expect(getCsDataOfElement).not.toHaveBeenCalled();
        expect(generateThread).not.toHaveBeenCalled();
        expect(toggleCollabPopup).not.toHaveBeenCalled();
        expect(addFocusOverlay).not.toHaveBeenCalled();
    });

    it("should call generateThread when collab is enabled and pauseFeedback is false", async () => {
        hoistedConfigMocks.configGet.mockReturnValue({
            collab: { enable: true, pauseFeedback: false, isFeedbackMode: true },
        });

        await handleBuilderInteraction(makeParams(editableElement));

        expect(generateThread).toHaveBeenCalled();
    });
});

describe("handleBuilderInteraction — alt+click on anchor", () => {
    const originalLocation = window.location;

    beforeEach(() => {
        Object.defineProperty(window, "location", {
            value: { href: "" },
            writable: true,
        });
    });

    afterEach(() => {
        Object.defineProperty(window, "location", {
            value: originalLocation,
            writable: true,
        });
    });

    it("prevents default/propagation and drives navigation itself instead of relying on the native click", async () => {
        document.body.innerHTML = "";
        const anchor = document.createElement("a");
        anchor.href = "https://example.com/blog#anchor";
        document.body.appendChild(anchor);

        const params = makeParams(anchor);
        Object.defineProperty(params.event, "altKey", { value: true });
        const preventDefaultSpy = vi.spyOn(params.event, "preventDefault");
        const stopPropagationSpy = vi.spyOn(params.event, "stopPropagation");

        await handleBuilderInteraction(params);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(stopPropagationSpy).toHaveBeenCalled();
        expect(window.location.href).toBe("https://example.com/blog#anchor");
        expect(getCsDataOfElement).not.toHaveBeenCalled();
    });

    it("does nothing on alt+click when the target isn't an anchor", async () => {
        const editableElement = makeEditableElement();
        const params = makeParams(editableElement);
        Object.defineProperty(params.event, "altKey", { value: true });
        const preventDefaultSpy = vi.spyOn(params.event, "preventDefault");

        await handleBuilderInteraction(params);

        expect(preventDefaultSpy).not.toHaveBeenCalled();
        expect(window.location.href).toBe("");
        expect(getCsDataOfElement).not.toHaveBeenCalled();
    });

    it("opens target=_blank links (RTE 'open in new tab') in a new tab instead of hijacking the iframe", async () => {
        document.body.innerHTML = "";
        const anchor = document.createElement("a");
        anchor.href = "https://example.com/other-entry";
        anchor.target = "_blank";
        document.body.appendChild(anchor);

        const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
        const params = makeParams(anchor);
        Object.defineProperty(params.event, "altKey", { value: true });

        await handleBuilderInteraction(params);

        expect(openSpy).toHaveBeenCalledWith(
            "https://example.com/other-entry",
            "_blank",
            "noopener,noreferrer"
        );
        expect(window.location.href).toBe("");
        openSpy.mockRestore();
    });

    it("resolves the anchor ancestor when the click lands on nested formatted text inside the link", async () => {
        document.body.innerHTML = "";
        const anchor = document.createElement("a");
        anchor.href = "https://example.com/bold-link";
        const bold = document.createElement("strong");
        bold.textContent = "click me";
        anchor.appendChild(bold);
        document.body.appendChild(anchor);

        const params = makeParams(bold);
        Object.defineProperty(params.event, "altKey", { value: true });
        const preventDefaultSpy = vi.spyOn(params.event, "preventDefault");

        await handleBuilderInteraction(params);

        expect(preventDefaultSpy).toHaveBeenCalled();
        expect(window.location.href).toBe("https://example.com/bold-link");
    });

    it("blocks unsafe url schemes like javascript: on alt+click", async () => {
        document.body.innerHTML = "";
        const anchor = document.createElement("a");
        anchor.href = "javascript:alert(1)";
        document.body.appendChild(anchor);

        const params = makeParams(anchor);
        Object.defineProperty(params.event, "altKey", { value: true });

        await handleBuilderInteraction(params);

        expect(window.location.href).toBe("");
    });

    it("allows relative hrefs (resolve to the page's own http/https scheme)", async () => {
        document.body.innerHTML = "";
        const anchor = document.createElement("a");
        anchor.href = "/other-entry";
        document.body.appendChild(anchor);

        const params = makeParams(anchor);
        Object.defineProperty(params.event, "altKey", { value: true });

        await handleBuilderInteraction(params);

        expect(window.location.href).toBe(anchor.href);
    });
});
