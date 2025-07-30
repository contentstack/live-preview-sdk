import React from "preact/compat";
import { render, fireEvent, waitFor } from "@testing-library/preact";
import { EmptyBlock } from "../emptyBlock";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { observeParentAndFocusNewInstance } from "../../utils/multipleElementAddButton";
import { CslpData } from "../../../cslp/types/cslp.types";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../utils/multipleElementAddButton", () => ({
    observeParentAndFocusNewInstance: vi.fn(),
}));

describe("EmptyBlock", () => {
    const mockDetails = {
        fieldMetadata: {
            cslpValue: "parent.cslp.value",
        } as CslpData,
        fieldSchema: {
            display_name: "Test Block",
        } as ISchemaFieldMap,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    test("should render correctly", () => {
        const { getByText, getByTestId } = render(
            <EmptyBlock details={mockDetails} />
        );

        expect(
            getByText(
                (_, element) =>
                    element?.textContent ===
                    "This page doesn’t have any Test Block added. Click the button below to add one."
            )
        ).toBeTruthy();
        expect(
            getByTestId("visual-builder__empty-block-add-button")
        ).toBeTruthy();
        expect(getByText("Add Test Block")).toBeTruthy();
    });

    test("should call sendAddInstanceEvent on button click", async () => {
        const { getByTestId } = render(<EmptyBlock details={mockDetails} />);
        const addButton = getByTestId("visual-builder__empty-block-add-button");

        fireEvent.click(addButton);

        await waitFor(() => {
            expect((visualBuilderPostMessage as any).send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
                {
                    fieldMetadata: mockDetails.fieldMetadata,
                    index: 0,
                }
            );
        });

        expect(observeParentAndFocusNewInstance).toHaveBeenCalledWith({
            parentCslp: mockDetails.fieldMetadata.cslpValue,
            index: 0,
        });
    });
});
