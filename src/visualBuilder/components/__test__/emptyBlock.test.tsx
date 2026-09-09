import React from "preact/compat";
import { render, fireEvent, waitFor } from "@testing-library/preact";
import { EmptyBlock } from "../emptyBlock";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { observeParentAndFocusNewInstance } from "../../utils/multipleElementAddButton";
import { CslpData } from "../../../cslp/types/cslp.types";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { getDOMEditStack } from "../../utils/getCsDataOfElement";
import { getPeerLockForField } from "../../utils/fieldLockIndicator";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../utils/multipleElementAddButton", () => ({
    observeParentAndFocusNewInstance: vi.fn(),
}));

vi.mock("../../utils/fieldLockIndicator", () => ({
    getPeerLockForField: vi.fn(() => null),
}));

const flushMicrotasks = async () => {
    for (let i = 0; i < 10; i += 1) await Promise.resolve();
};

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

    test("claims the field lock before adding, so a peer sees it", async () => {
        const host = document.createElement("div");
        host.setAttribute("data-cslp", "ct.entry.en-us.blocks_field");
        document.body.appendChild(host);

        const { getByTestId } = render(<EmptyBlock details={mockDetails} />, {
            container: host,
        });
        fireEvent.click(getByTestId("visual-builder__empty-block-add-button"));

        await waitFor(() => {
            expect((visualBuilderPostMessage as any).send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.FOCUS_FIELD,
                { DOMEditStack: getDOMEditStack(host) }
            );
        });

        // the lock must be claimed first, or the parent applies the add with no lock
        const events = (visualBuilderPostMessage as any).send.mock.calls.map(
            (call: unknown[]) => call[0]
        );
        expect(events).toEqual([
            VisualBuilderPostMessageEvents.FOCUS_FIELD,
            VisualBuilderPostMessageEvents.ADD_INSTANCE,
        ]);
    });

    test("does not send an empty edit stack, which the parent reads as a deselect", async () => {
        // no ancestor carries data-cslp, so the stack comes back empty
        const { getByTestId } = render(<EmptyBlock details={mockDetails} />);
        fireEvent.click(getByTestId("visual-builder__empty-block-add-button"));

        await waitFor(() => {
            expect((visualBuilderPostMessage as any).send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.ADD_INSTANCE,
                { fieldMetadata: mockDetails.fieldMetadata, index: 0 }
            );
        });
        expect((visualBuilderPostMessage as any).send).not.toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.FOCUS_FIELD,
            expect.anything()
        );
    });

    test("adds nothing when a peer holds the field", async () => {
        (getPeerLockForField as any).mockReturnValueOnce({
            user: { uid: "peer" },
        });

        const { getByTestId } = render(<EmptyBlock details={mockDetails} />);
        fireEvent.click(getByTestId("visual-builder__empty-block-add-button"));
        await flushMicrotasks();

        expect((visualBuilderPostMessage as any).send).not.toHaveBeenCalled();
        expect(observeParentAndFocusNewInstance).not.toHaveBeenCalled();
    });
});
