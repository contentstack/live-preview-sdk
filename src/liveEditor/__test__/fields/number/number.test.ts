import "@testing-library/jest-dom/extend-expect";
import { fireEvent, prettyDOM, screen } from "@testing-library/preact";
import { userEvent } from "@testing-library/user-event";
import { act } from "preact/test-utils";
import { VisualEditor } from "../../..";
import { getAllContentTypes } from "../../../../__test__/data/contentType";
import Config from "../../../../configManager/configManager";
import { ILivePreviewModeConfig } from "../../../../types/types";
import { LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY } from "../../../utils/constants";
import { getDOMEditStack } from "../../../utils/getCsDataOfElement";
import liveEditorPostMessage from "../../../utils/liveEditorPostMessage";
import { LiveEditorPostMessageEvents } from "../../../utils/types/postMessage.types";

const FIELD_VALUE = "123";
const CT_UID = "all_fields";
const FIELD_UID = "number";

global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

const contentTypes = getAllContentTypes();

jest.mock("../../../utils/liveEditorPostMessage", () => {
    return {
        __esModule: true,
        default: {
            send: jest
                .fn()
                .mockImplementation((eventName: string, params: any) => {
                    if (eventName === "init")
                        return Promise.resolve({
                            contentTypes,
                        });
                    else if (
                        eventName ===
                        LiveEditorPostMessageEvents.GET_FIELD_SCHEMA
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
                        eventName === LiveEditorPostMessageEvents.GET_FIELD_DATA
                    ) {
                        return Promise.resolve({
                            fieldData: FIELD_VALUE,
                        });
                    }
                    return Promise.resolve();
                }),
            on: jest.fn(),
        },
    };
});

describe("number field", () => {
    let numberField: HTMLParagraphElement;
    let visualEditor: VisualEditor;

    beforeEach(() => {
        numberField = document.createElement("p");
        numberField.setAttribute(
            "data-cslp",
            `${CT_UID}.bltEntryUid.en-us.${FIELD_UID}`
        );
        numberField.textContent = FIELD_VALUE;
        numberField.getBoundingClientRect = jest.fn(() => ({
            x: 100,
            y: 100,
            top: 100,
            left: 100,
            right: 0,
            bottom: 0,
            width: 100,
            height: 25,
            toJSON: jest.fn(),
        }));

        document.body.appendChild(numberField);

        Config.set("mode", ILivePreviewModeConfig.EDITOR);
        visualEditor = new VisualEditor();
    });

    afterEach(() => {
        numberField.remove();
        visualEditor.destroy();
    });

    test("should have hover outline (dashed) on hover", async () => {
        await act(() => {
            fireEvent.mouseMove(numberField);
        });

        const hoverOutline = screen.getByTestId("visual-editor__hover-outline");
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
        const topOverlay = screen.getByTestId("visual-editor__overlay--top");
        const bottomOverlay = screen.getByTestId(
            "visual-editor__overlay--bottom"
        );
        const leftOverlay = screen.getByTestId("visual-editor__overlay--left");
        const rightOverlay = screen.getByTestId(
            "visual-editor__overlay--right"
        );

        const overlays = [topOverlay, bottomOverlay, leftOverlay, rightOverlay];
        for (const overlay of overlays) {
            expect(overlay).toBeVisible();
        }
    });

    test("should have a field path dropdown", async () => {
        await userEvent.click(numberField);
        const focussedToolbar = screen.getByTestId(
            "visual-editor__focused-toolbar"
        );
        expect(focussedToolbar).toBeVisible();

        // expect field display_name as dropdown label
        const fieldLabel = focussedToolbar.querySelector(
            ".visual-editor__focused-toolbar__text"
        );
        expect(fieldLabel).toHaveTextContent("Number");
    });

    test("should contain a data-cslp-field-type attribute", async () => {
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);

        expect(numberField).toHaveAttribute(
            LIVE_EDITOR_FIELD_TYPE_ATTRIBUTE_KEY
        );
    });

    test("should send a focus field message to parent", async () => {
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);

        expect(liveEditorPostMessage?.send).toBeCalledWith(
            LiveEditorPostMessageEvents.FOCUS_FIELD,
            {
                DOMEditStack: getDOMEditStack(numberField),
            }
        );
    });

    test("should only accept characters like a number input", async () => {
        VisualEditor.VisualEditorGlobalState.value.previousSelectedEditableDOM =
            numberField;

        await userEvent.click(numberField);
        await userEvent.keyboard("ab56c78e-h10");

        expect(numberField).toHaveTextContent(`${FIELD_VALUE}5678e-10`);
    });
});
