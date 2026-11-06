import { render, waitFor, cleanup } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../../fieldLabelWrapper";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import React from "preact/compat";
import { mockFieldMetadata } from "./fieldLabelWrapper.mocks";

vi.mock("../../../utils/visualBuilderPostMessage", () => ({
    default: { send: vi.fn().mockResolvedValue({}) },
}));

vi.mock("../../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockResolvedValue({
            display_name: "Title",
            data_type: "text",
            field_metadata: {},
            uid: "title",
        }),
    },
}));

vi.mock("../../../utils/fetchEntryPermissionsAndStageDetails", () => ({
    fetchEntryPermissionsAndStageDetails: vi.fn().mockResolvedValue({}),
}));

// class names only; generating the real stylesheet slows jsdom down test after test
vi.mock("../../../visualBuilder.style", () => ({
    visualBuilderStyles: () =>
        new Proxy({}, { get: (_target, name) => String(name) }),
}));

describe("FieldLabelWrapperComponent - reference map request", () => {
    afterEach(() => {
        cleanup();
        vi.clearAllMocks();
    });

    test("names the hovered field's entry so the editor can skip building the whole map", async () => {
        render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={{
                    editableElement: document.createElement("div"),
                    cslpData: "",
                    fieldMetadata: mockFieldMetadata,
                }}
                parentPaths={[]}
                getParentEditableElement={() => document.createElement("div")}
            />
        );

        await waitFor(() =>
            expect(visualBuilderPostMessage!.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.REFERENCE_MAP,
                {
                    entry_uid: mockFieldMetadata.entry_uid,
                    content_type_uid: mockFieldMetadata.content_type_uid,
                    locale: mockFieldMetadata.locale,
                }
            )
        );
    });
});
