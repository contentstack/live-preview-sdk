import crypto from "crypto";
import { getFieldSchemaMap } from "../../__test__/data/fieldSchemaMap";
import {
    getElementBytestId,
    mockGetBoundingClientRect,
    sleep,
    triggerAndWaitForClickAction,
    waitForBuilderSDKToBeInitialized,
    waitForToolbaxToBeVisible,
} from "../../__test__/utils";
import Config from "../../configManager/configManager";
import { FieldSchemaMap } from "../utils/fieldSchemaMap";
import { waitFor, screen, cleanup } from "@testing-library/preact";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import { VisualBuilder } from "../index";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { Mock } from "vitest";
import { ILivePreviewModeConfig } from "../../types/types";
import * as kbModule from "../listeners/keyboardShortcuts";
import * as variantModule from "../eventManager/useVariantsPostMessageEvent";

const INLINE_EDITABLE_FIELD_VALUE = "Hello World";

vi.mock("../utils/visualBuilderPostMessage", async (importOriginal) => {
    const { getAllContentTypes } = await vi.importActual<
        typeof import("../../__test__/data/contentType")
    >("../../__test__/data/contentType");
    const contentTypes = getAllContentTypes();

    return {
        __esModule: true,
        default: {
            send: vi.fn((eventName: string) => {
                if (eventName === "init") {
                    return Promise.resolve({
                        contentTypes,
                    });
                }
                // Mock workflow stage details and permissions
                if (eventName === "get-workflow-stage-details") {
                    return Promise.resolve({
                        stage: { name: "Draft" },
                        permissions: {
                            entry: {
                                update: true,
                            },
                        },
                    });
                }
                if (eventName === "get-entry-permissions") {
                    return Promise.resolve({
                        can_update: true,
                        can_delete: true,
                    });
                }
                if (eventName === "get-resolved-variant-permissions") {
                    return Promise.resolve({
                        can_update: true,
                    });
                }
                if (eventName === "field-location-data") {
                    return Promise.resolve({ apps: [] });
                }
                // Mock field data for modular blocks
                if (eventName === "get-field-data") {
                    return Promise.resolve({
                        fieldData: INLINE_EDITABLE_FIELD_VALUE,
                    });
                }
                // Mock field display names
                if (eventName === "get-field-display-names") {
                    return Promise.resolve({
                        "all_fields.blt58a50b4cebae75c5.en-us.modular_blocks.0.block.single_line":
                            "Single Line",
                    });
                }
                return Promise.resolve({});
            }),
            on: vi.fn(() => ({ unregister: vi.fn() })),
        },
    };
});

vi.mock("../../utils/index.ts", async () => {
    const actual = await vi.importActual("../../utils");
    return {
        __esModule: true,
        ...actual,
        isOpenInBuilder: vi.fn().mockReturnValue(true),
    };
});

Object.defineProperty(globalThis, "crypto", {
    value: {
        getRandomValues: (arr: Array<any>) => crypto.randomBytes(arr.length),
        randomUUID: () => crypto.randomUUID(),
    },
});
// Increase the timeout for the test
describe(
    "Visual builder",
    () => {
        beforeAll(() => {
            FieldSchemaMap.setFieldSchema(
                "all_fields",
                getFieldSchemaMap().all_fields
            );
            Config.set("mode", 2);
            vi.spyOn(
                document.documentElement,
                "clientWidth",
                "get"
            ).mockReturnValue(100);
            vi.spyOn(
                document.documentElement,
                "clientHeight",
                "get"
            ).mockReturnValue(100);
            vi.spyOn(document.body, "scrollHeight", "get").mockReturnValue(100);
        });

    beforeEach(() => {
        vi.clearAllMocks();
        document.getElementsByTagName("html")[0].innerHTML = "";
        cleanup();
    });

    afterAll(() => {
        FieldSchemaMap.clear();
    });

    test("should append a visual builder container to the DOM", async () => {
        let visualBuilderDOM = document.querySelector(
            ".visual-builder__container"
        );

        expect(visualBuilderDOM).toBeNull();

        const x = new VisualBuilder();
        await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);

        visualBuilderDOM = document.querySelector(
            `[data-testid="visual-builder__container"]`
        );

        expect(
            document.querySelector(
                '[data-testid="visual-builder__cursor"]'
            )
        ).toBeInTheDocument();
        expect(
            document.querySelector(
                '[data-testid="visual-builder__focused-toolbar"]'
            )
        ).toBeInTheDocument();
        expect(
            document.querySelector(
                '[data-testid="visual-builder__hover-outline"]'
            )
        ).toBeInTheDocument();
        expect(
            document.querySelector(
                '[data-testid="visual-builder__overlay__wrapper"]'
            )
        ).toBeInTheDocument();
        x.destroy();
    });

    test(
        "should add overlay to DOM when clicked", 
        async () => {
        const h1Tag = document.createElement("h1");
        h1Tag.textContent = INLINE_EDITABLE_FIELD_VALUE;
        h1Tag.setAttribute(
            "data-cslp",
            "all_fields.blt58a50b4cebae75c5.en-us.modular_blocks.0.block.single_line"
        );
        document.body.appendChild(h1Tag);
        mockGetBoundingClientRect(h1Tag);
        const x = new VisualBuilder();

        await triggerAndWaitForClickAction(visualBuilderPostMessage, h1Tag);

        const overlayOutline = document.querySelector(
            '[data-testid="visual-builder__overlay--outline"]'
        );
        // Verify overlay exists and has correct positioning
        expect(overlayOutline).toBeInTheDocument();
        expect(overlayOutline).toHaveStyle({
            top: "10px",
            left: "10px",
            width: "10px",
            height: "5px",
        });

        x.destroy();
    });

    describe("VisualBuilder init — early return conditions", () => {
        afterEach(() => {
            Config.set("mode", 2);
            Config.set("enable", true);
        });

        test("should not send init postMessage when enable is false", () => {
            Config.set("enable", false);
            new VisualBuilder();
            expect(visualBuilderPostMessage.send).not.toHaveBeenCalledWith(
                "init",
                expect.anything()
            );
        });

        test("should not send init postMessage when mode is below BUILDER", () => {
            Config.set("mode", ILivePreviewModeConfig.PREVIEW);
            new VisualBuilder();
            expect(visualBuilderPostMessage.send).not.toHaveBeenCalledWith(
                "init",
                expect.anything()
            );
        });

        test("should call addKeyboardShortcuts and getHighlightVariantFieldsStatus when windowType is BUILDER", async () => {
            Config.set("mode", 2);
            const kbSpy = vi
                .spyOn(kbModule, "addKeyboardShortcuts")
                .mockImplementation(() => {});
            const highlightSpy = vi
                .spyOn(variantModule, "getHighlightVariantFieldsStatus")
                .mockResolvedValue({ highlightVariantFields: false });

            const vb = new VisualBuilder();
            await waitForBuilderSDKToBeInitialized(visualBuilderPostMessage);
            await waitFor(() => {
                expect(kbSpy).toHaveBeenCalled();
            });
            expect(highlightSpy).toHaveBeenCalled();
            vb.destroy();
        });
    });
});
