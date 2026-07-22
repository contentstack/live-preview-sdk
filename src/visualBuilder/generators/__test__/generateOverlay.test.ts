import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { sendFieldEvent } from "../generateOverlay";
import { VisualBuilder } from "../..";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import * as cslpdata from "../../../cslp/cslpdata";

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

vi.spyOn(cslpdata, "extractDetailsFromCslp");

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

        expect(cslpdata.extractDetailsFromCslp).not.toHaveBeenCalled();
        expect(FieldSchemaMap.getFieldSchema).not.toHaveBeenCalled();
        expect(visualBuilderPostMessage?.send).not.toHaveBeenCalled();
    });

    const setupMultilineField = () => {
        previousSelectedEditableDOM.setAttribute(
            "data-cslp",
            "content_type.entry.field"
        );
        previousSelectedEditableDOM.innerHTML = "line1<br>line2";
        const innerTextSetter = vi.fn();
        Object.defineProperty(previousSelectedEditableDOM, "innerText", {
            configurable: true,
            get: () => "line1\nline2",
            set: innerTextSetter,
        });
        vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue({
            display_name: "Multi",
            data_type: "text",
            field_metadata: { multiline: true },
        } as any);
        return innerTextSetter;
    };

    it("normalizes a multiline value for the on-type SYNC_FIELD without rewriting the editable DOM", async () => {
        const innerTextSetter = setupMultilineField();

        sendFieldEvent({
            visualBuilderContainer,
            eventType: VisualBuilderPostMessageEvents.SYNC_FIELD,
        });

        await vi.waitFor(() =>
            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.SYNC_FIELD,
                expect.objectContaining({ data: "line1\nline2" })
            )
        );
        expect(innerTextSetter).not.toHaveBeenCalled();
    });

    it("rewrites the editable DOM with the normalized value on the commit UPDATE_FIELD", async () => {
        const innerTextSetter = setupMultilineField();

        sendFieldEvent({
            visualBuilderContainer,
            eventType: VisualBuilderPostMessageEvents.UPDATE_FIELD,
        });

        await vi.waitFor(() =>
            expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
                VisualBuilderPostMessageEvents.UPDATE_FIELD,
                expect.objectContaining({ data: "line1\nline2" })
            )
        );
        expect(innerTextSetter).toHaveBeenCalledWith("line1\nline2");
    });
});
