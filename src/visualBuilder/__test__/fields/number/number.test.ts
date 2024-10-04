import { fireEvent, prettyDOM, screen } from "@testing-library/preact";
// TODO: @faraazb check if we still need this library. If not let's remove and uninstall it.
import { userEvent } from "@testing-library/user-event";
import { act } from "preact/test-utils";
import { getAllContentTypes } from "../../../../__test__/data/contentType";
import Config from "../../../../configManager/configManager";
import { ILivePreviewModeConfig } from "../../../../types/types";
import { VISUAL_BUILDER_FIELD_TYPE_ATTRIBUTE_KEY } from "../../../utils/constants";
import { getDOMEditStack } from "../../../utils/getCsDataOfElement";
import visualBuilderPostMessage from "../../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../../utils/types/postMessage.types";
import { VisualBuilder } from "../../..";
import { FieldSchemaMap } from "../../../utils/fieldSchemaMap";

const FIELD_VALUE = "123";
const CT_UID = "all_fields";
const FIELD_UID = "number";
const FIELD_CSLP = `${CT_UID}.bltEntryUid.en-us.${FIELD_UID}`;
// this now comes from visual builder, since sometimes
// the display name is also dependent on the entry
const FIELD_DISPLAY_NAME = "Great Number";

const numberFieldSchema = {
    data_type: "number",
    display_name: "Number",
    uid: "number",
    field_metadata: {
        description: "",
        default_value: "",
    },
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
};

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
                        return {
                            fieldSchemaMap: {
                                [numberFieldSchema.uid]: numberFieldSchema,
                            },
                        };
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: FIELD_VALUE,
                        });
                    } else if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                    ) {
                        return Promise.resolve({
                            [FIELD_CSLP]: FIELD_DISPLAY_NAME,
                        });
                    }
                    return Promise.resolve();
                }),
            on: vi.fn(),
        },
    };
});

describe.skip("number field", () => {
    let numberField: HTMLParagraphElement;
    let visualBuilder: VisualBuilder;

    beforeEach(() => {
        numberField = document.createElement("p");
        numberField.setAttribute("data-cslp", FIELD_CSLP);
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

        expect(topOverlay).toBeVisible();
        expect(bottomOverlay).toBeVisible();
        expect(leftOverlay).toBeVisible();
        expect(rightOverlay).toBeVisible();
    });

    test("should have a field path dropdown", async () => {
        fireEvent.click(numberField);
        const focussedToolbar = await screen.findByTestId(
            "visual-builder__focused-toolbar"
        );
        console.log(prettyDOM(document.body));
        expect(focussedToolbar).toBeVisible();

        const fieldLabel = await screen.findByTestId(
            "visual-builder__focused-toolbar__text"
        );
        expect(fieldLabel).toHaveTextContent(FIELD_DISPLAY_NAME);
    });

    test("should contain a data-cslp-field-type attribute", async () => {
        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            numberField;

        userEvent.click(numberField);

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
