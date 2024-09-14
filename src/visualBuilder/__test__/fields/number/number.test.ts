import { fireEvent, prettyDOM, screen } from "@testing-library/preact";
// TODO: @faraazb check if we still need this library. If not let's remove and uninstall it.
import { userEvent } from "@testing-library/user-event";
import { act } from "preact/test-utils";
import { VisualBuilder } from "../../..";
import { getAllContentTypes } from "../../../../__test__/data/contentType";
import Config from "../../../../configManager/configManager";
import { ILivePreviewModeConfig } from "../../../../types/types";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../../../utils/constants";
import { getDOMEditStack } from "../../../utils/getCsDataOfElement";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";

const FIELD_VALUE = "123";
const CT_UID = "all_fields";
const FIELD_UID = "number";

global.ResizeObserver = vi.fn().mockImplementation(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

const contentTypes = getAllContentTypes();

vi.mock("../../../utils/visualBuilderPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: vi
                .fn()
                .mockImplementation((eventName: string, params: any) => {
                    if (eventName === "init")
                        return Promise.resolve({
                            contentTypes,
                        });
                    else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_SCHEMA
                    ) {
                        const { contentTypeUid } = params;
                        const numberField = contentTypes[
                            contentTypeUid
                        ].schema.find(
                            (field: Record<string, any>) =>
                                field.uid === FIELD_UID
                        );
                        if (!numberField) {
                            return {};
                        }
                        // since we are testing the number field, we can only return the number field's schema
                        return {
                            fieldSchemaMap: {
                                [numberField.uid]: numberField,
                            },
                        };
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: FIELD_VALUE,
                        });
                    }
                    return Promise.resolve();
                }),
            on: vi.fn(),
        },
    };
});

describe("number field", () => {
    let numberField: HTMLParagraphElement;
    let visualBuilder: VisualBuilder;

    beforeEach(() => {
        numberField = document.createElement("p");
        numberField.setAttribute(
            "data-cslp",
            `${CT_UID}.bltEntryUid.en-us.${FIELD_UID}`
        );
        numberField.textContent = FIELD_VALUE;
        numberField.getBoundingClientRect = vi.fn(() => ({
            x: 100,
            y: 100,
            top: 100,
            left: 100,
            right: 0,
            bottom: 0,
            width: 100,
            height: 25,
            toJSON: vi.fn(),
        }));

        document.body.appendChild(numberField);

        Config.set("mode", ILivePreviewModeConfig.BUILDER);
        visualBuilder = new VisualBuilder();
    });

    afterEach(() => {
        numberField.remove();
        visualBuilder.destroy();
    });

    test("should have hover outline (dashed) on hover", async () => {
        await act(() => {
            fireEvent.mouseMove(numberField);
        });

        const hoverOutline = screen.getByTestId(
            "visual-builder__hover-outline"
        );
        expect(hoverOutline).toBeInTheDocument();
        expect(hoverOutline.style.top).toEqual("100px");
        expect(hoverOutline.style.left).toEqual("100px");
        expect(hoverOutline.style.width).toEqual("100px");
        expect(hoverOutline.style.height).toEqual("25px");
    });

    it("should have an overlay", async () => {
        await act(() => {
            fireEvent.click(numberField);
        });
        const topOverlay = screen.getByTestId("visual-builder__overlay--top");
        const bottomOverlay = screen.getByTestId(
            "visual-builder__overlay--bottom"
        );
        const leftOverlay = screen.getByTestId("visual-builder__overlay--left");
        const rightOverlay = screen.getByTestId(
            "visual-builder__overlay--right"
        );

        const overlays = [topOverlay, bottomOverlay, leftOverlay, rightOverlay];
        for (const overlay of overlays) {
            expect(overlay).toBeVisible();
        }
    });

    test("should have a field path dropdown", async () => {
        await userEvent.click(numberField);
        const focussedToolbar = screen.getByTestId(
            "visual-builder__focused-toolbar"
        );
        expect(focussedToolbar).toBeVisible();

        // expect field display_name as dropdown label
        const fieldLabel = focussedToolbar.querySelector(
            ".visual-builder__focused-toolbar__text"
        );
        expect(fieldLabel).toHaveTextContent("Number");
    });

    test("should contain a data-cslp-field-type attribute", async () => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);

        expect(numberField).toHaveAttribute(
            VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY
        );
    });

    test("should send a focus field message to parent", async () => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);

        expect(visualBuilderPostMessage?.send).toBeCalledWith(
            VisualBuilderPostMessageEvents.FOCUS_FIELD,
            {
                DOMEditStack: getDOMEditStack(numberField),
            }
        );
    });

    test("should only accept characters like a number input", async () => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);
        await userEvent.keyboard("ab56c78e-h10");

        expect(numberField).toHaveTextContent(`${FIELD_VALUE}5678e-10`);
    });
});
