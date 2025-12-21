import { appendFieldToolbar } from "../generateToolbar";
import { getEntryPermissionsCached } from "../../utils/getEntryPermissionsCached";
import { EntryPermissions } from "../../utils/getEntryPermissions";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { CslpData } from "../../../cslp/types/cslp.types";
import { render as renderOriginal } from "preact";

vi.mock("preact", () => ({
    render: vi.fn(),
}));
const render = vi.mocked(renderOriginal);

/**
 * Tests `appendFieldToolbar` in generateToolbar.ts
 */
describe("appendFieldToolbar", () => {
    let mockEventDetails: VisualBuilderCslpEventDetails;
    let focusedToolbar: HTMLDivElement;
    let hideOverlay: () => void;

    beforeEach(() => {
        mockEventDetails = {
            editableElement: document.createElement("div"),
            cslpData: "test.cslp",
            fieldMetadata: {
                entry_uid: "test-entry",
                content_type_uid: "test-content-type",
                cslpValue: "test.cslp",
                locale: "en-us",
                fieldPath: "test-field",
                fieldPathWithIndex: "test-field[0]",
                multipleFieldMetadata: {
                    index: 0,
                    parentDetails: {
                        parentPath: "",
                        parentCslpValue: "",
                    },
                },
                instance: {
                    fieldPathWithIndex: "test-field[0]",
                },
                variant: "default",
            } as CslpData,
        };

        focusedToolbar = document.createElement("div");
        focusedToolbar.classList.add("visual-builder__focused-toolbar");
        document.body.appendChild(focusedToolbar);

        hideOverlay = vi.fn();
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    test("should not render toolbar if it already exists", async () => {
        const existingToolbar = document.createElement("div");
        existingToolbar.classList.add(
            "visual-builder__focused-toolbar__multiple-field-toolbar"
        );
        focusedToolbar.appendChild(existingToolbar);

        await appendFieldToolbar(mockEventDetails, focusedToolbar, hideOverlay);

        expect(render).not.toHaveBeenCalled();
    });

    test("should render FieldToolbarComponent with correct props", async () => {
        await appendFieldToolbar(mockEventDetails, focusedToolbar, hideOverlay);

        expect(render).toHaveBeenCalledWith(
            expect.any(Object),
            expect.any(DocumentFragment)
        );

        const renderCall = (render as any).mock.calls[0][0];
        expect(renderCall.props.eventDetails).toEqual(mockEventDetails);
        expect(renderCall.props.hideOverlay).toBe(hideOverlay);
        expect(renderCall.props.isVariant).toBe(false);
    });

    test("should render FieldToolbarComponent with variant prop", async () => {
        await appendFieldToolbar(
            mockEventDetails,
            focusedToolbar,
            hideOverlay,
            true
        );

        const renderCall = (render as any).mock.calls[0][0];
        expect(renderCall.props.isVariant).toBe(true);
    });

    test("should append rendered component to focusedToolbar", async () => {
        const mockAppend = vi.spyOn(focusedToolbar, "append");
        await appendFieldToolbar(mockEventDetails, focusedToolbar, hideOverlay);
        expect(mockAppend).toHaveBeenCalledWith(expect.any(DocumentFragment));
    });

    test("should provide entry permissions to FieldToolbarComponent", async () => {
        const mockEntryPermissions: EntryPermissions = {
            create: true,
            read: true,
            update: true,
            delete: true,
            publish: true,
        };
        (getEntryPermissionsCached as any).mockResolvedValue(
            mockEntryPermissions
        );

        await appendFieldToolbar(mockEventDetails, focusedToolbar, hideOverlay);

        const renderCall = (render as any).mock.calls[0][0];
        expect(renderCall.props.entryPermissions).toEqual(mockEntryPermissions);
    });
});
