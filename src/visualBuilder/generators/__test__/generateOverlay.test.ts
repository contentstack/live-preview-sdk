import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendFieldEvent } from "../generateOverlay";
import { VisualBuilder } from "../..";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import { extractDetailsFromCslp } from "../../../cslp/cslpdata";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../utils/fieldSchemaMap", () => ({
    FieldSchemaMap: {
        getFieldSchema: vi.fn().mockResolvedValue({
            display_name: "Test Field",
            data_type: "text",
        }),
    },
}));

vi.mock("../../../cslp/cslpdata", () => ({
    extractDetailsFromCslp: vi.fn(),
}));

describe("sendFieldEvent", () => {
    let previousSelectedEditableDOM: HTMLElement;
    let visualBuilderContainer: HTMLElement;

    beforeEach(() => {
        previousSelectedEditableDOM = document.createElement("div");
        previousSelectedEditableDOM.setAttribute("contenteditable", "true");
        previousSelectedEditableDOM.innerText = "Test content";
        document.body.appendChild(previousSelectedEditableDOM);

        visualBuilderContainer = document.createElement("div");
        document.body.appendChild(visualBuilderContainer);

        VisualBuilder.VisualBuilderGlobalState.value.previousSelectedEditableDOM =
            previousSelectedEditableDOM;
    });

    afterEach(() => {
        document.body.innerHTML = "";
        vi.clearAllMocks();
    });

    it("should return early and not send event when data-cslp attribute is invalid", () => {
        previousSelectedEditableDOM.setAttribute("data-cslp", "");

        sendFieldEvent({
            visualBuilderContainer,
            eventType: VisualBuilderPostMessageEvents.UPDATE_FIELD,
        });

        expect(extractDetailsFromCslp).not.toHaveBeenCalled();
        expect(FieldSchemaMap.getFieldSchema).not.toHaveBeenCalled();
        expect(visualBuilderPostMessage?.send).not.toHaveBeenCalled();
    });
});

