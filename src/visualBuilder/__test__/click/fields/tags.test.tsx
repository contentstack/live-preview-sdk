import {
    act,
    cleanup,
    findByTestId,
    fireEvent,
    render,
} from "@testing-library/preact";
import "@testing-library/jest-dom";
import { vi } from "vitest";
import { CslpData } from "../../../../cslp/types/cslp.types";
import FieldToolbarComponent from "../../../components/FieldToolbar";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";
import { isFieldDisabled } from "../../../utils/isFieldDisabled";
import { ISchemaFieldMap } from "../../../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";

vi.mock("../../../components/CommentIcon", () => ({
    default: () => <div>Comment Icon</div>,
}));

vi.mock("../../../components/FieldLocationIcon", () => ({
    FieldLocationIcon: () => <div>Field Location Icon</div>,
}));

vi.mock("../../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(() => Promise.resolve({})),
        on: vi.fn(() => ({ unregister: vi.fn() })),
    },
}));

vi.mock("../../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

vi.mock("../../../utils/getDiscussionIdByFieldMetaData", () => ({
    getDiscussionIdByFieldMetaData: vi.fn().mockResolvedValue(undefined),
}));

const EDIT_ID =
    "visual-builder__focused-toolbar__multiple-field-toolbar__edit-button";

// Synthetic entry tags field: single-valued schema, edited as one list.
const tagsSchema = {
    data_type: "tags",
    display_name: "Tags",
    uid: "tags",
    multiple: false,
    mandatory: false,
    non_localizable: false,
    unique: false,
} as unknown as ISchemaFieldMap;

const containerMetadata: CslpData = {
    entry_uid: "entry",
    content_type_uid: "ct",
    cslpValue: "ct.entry.en-us.tags",
    locale: "en-us",
    variant: undefined,
    fieldPath: "tags",
    fieldPathWithIndex: "tags",
    multipleFieldMetadata: { index: -1, parentDetails: null },
    instance: { fieldPathWithIndex: "tags" },
};

const chipMetadata: CslpData = {
    ...containerMetadata,
    cslpValue: "ct.entry.en-us.tags.1",
    multipleFieldMetadata: {
        index: 1,
        parentDetails: {
            parentPath: "tags",
            parentCslpValue: "ct.entry.en-us.tags",
        },
    },
    instance: { fieldPathWithIndex: "tags.1" },
};

describe("When entry tags are clicked in visual builder mode", () => {
    let targetElement: HTMLDivElement;

    const renderToolbar = async (fieldMetadata: CslpData) => {
        const view = render(
            <FieldToolbarComponent
                eventDetails={{
                    fieldMetadata,
                    editableElement: targetElement,
                    cslpData: "",
                }}
                hideOverlay={vi.fn()}
            />
        );
        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });
        return view;
    };

    beforeEach(() => {
        targetElement = document.createElement("div");
        document.body.appendChild(targetElement);
        vi.spyOn(FieldSchemaMap, "getFieldSchema").mockResolvedValue(
            tagsSchema
        );
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            reason: "",
        } as ReturnType<typeof isFieldDisabled>);
    });

    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
        vi.clearAllMocks();
        document.body.innerHTML = "";
    });

    test("container click posts the whole tags field", async () => {
        const { container } = await renderToolbar(containerMetadata);

        const edit = await findByTestId(
            container,
            EDIT_ID,
            {},
            { timeout: 1000 }
        );
        expect(edit).toBeEnabled();
        fireEvent.click(edit);

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
            {
                fieldMetadata: expect.objectContaining({
                    fieldPath: "tags",
                    fieldPathWithIndex: "tags",
                }),
            }
        );
    });

    test("chip click posts tags without the index", async () => {
        const { container } = await renderToolbar(chipMetadata);

        fireEvent.click(
            await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
        );

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.OPEN_FIELD_EDIT_MODAL,
            {
                fieldMetadata: {
                    ...chipMetadata,
                    instance: { fieldPathWithIndex: "tags" },
                    multipleFieldMetadata: {
                        ...chipMetadata.multipleFieldMetadata,
                        index: -1,
                    },
                },
            }
        );
        expect(chipMetadata.instance.fieldPathWithIndex).toBe("tags.1");
    });

    test("restricted tags field disables the edit button", async () => {
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            reason: "",
        } as ReturnType<typeof isFieldDisabled>);
        const { container } = await renderToolbar(containerMetadata);

        expect(
            await findByTestId(container, EDIT_ID, {}, { timeout: 1000 })
        ).toBeDisabled();
    });
});
