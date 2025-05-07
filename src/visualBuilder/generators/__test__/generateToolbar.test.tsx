import { describe, it, expect, vi, beforeEach } from "vitest";
import { appendFocusedToolbar, appendFieldToolbar, appendFieldPathDropdown } from "../generateToolbar";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { render } from "preact";
import FieldToolbarComponent from "../../components/FieldToolbar";
import FieldLabelWrapperComponent from "../../components/fieldLabelWrapper";
import { LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX } from "../../utils/constants";
import React from "preact/compat";

vi.mock("preact", () => ({
    render: vi.fn().mockImplementation((children, container) => {
        // container.appendChild(children);
    }),
}));

vi.mock("../../components/FieldToolbar", () => ({
    default: vi.fn(),
}));

vi.mock("../../components/fieldLabelWrapper", () => ({
    default: vi.fn().mockImplementation(() => <div>Test</div>),
}));

describe("generateToolbar", () => {
    const eventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        fieldMetadata: {},
    };
    const focusedToolbarElement = document.createElement("div");
    const spyAppendChild = vi.spyOn(focusedToolbarElement, "appendChild");
    const spyAppend = vi.spyOn(focusedToolbarElement, "append");

    const hideOverlay = vi.fn();

    beforeEach(() => {
        document.body.innerHTML = "";
        focusedToolbarElement.innerHTML = "";
        vi.clearAllMocks();
    });

    describe("appendFieldToolbar", () => {
        it("should render FieldToolbarComponent if not already present", async () => {
            await appendFieldToolbar(eventDetails, focusedToolbarElement, hideOverlay);

            expect(render).toBeCalled();
        });

        it("should not render FieldToolbarComponent if already present", async () => {
            focusedToolbarElement.innerHTML =
                '<div class="visual-builder__focused-toolbar__multiple-field-toolbar"></div>';

            await appendFieldToolbar(eventDetails, focusedToolbarElement, hideOverlay);

            expect(render).not.toHaveBeenCalled();
        });

        it("should append the rendered component to the focusedToolbarElement", async () => {
            await appendFieldToolbar(eventDetails, focusedToolbarElement, hideOverlay);

            expect(spyAppend).toHaveBeenCalledWith(expect.any(DocumentFragment));
        });
    });

    describe("appendFieldPathDropdown", () => {
        it("should render FieldLabelWrapperComponent if not already present", () => {
            const targetElement = document.createElement("div");
            targetElement.getBoundingClientRect = vi.fn(() => ({
                top: 100,
                left: 100,
                right: 200,
                height: 50,
            } as DOMRect));
            eventDetails.editableElement = targetElement;

            appendFieldPathDropdown(eventDetails, focusedToolbarElement);

            expect(render).toBeCalled();
        });

        it("should not render FieldLabelWrapperComponent if already present", () => {
            document.body.innerHTML =
                '<div class="visual-builder__focused-toolbar__field-label-wrapper"></div>';

            appendFieldPathDropdown(eventDetails, focusedToolbarElement);

            expect(render).not.toHaveBeenCalled();
        });

        it("should append the rendered component to the focusedToolbarElement", () => {
            const targetElement = document.createElement("div");
            targetElement.getBoundingClientRect = vi.fn(() => ({
                top: 100,
                left: 100,
                right: 200,
                height: 50,
            } as DOMRect));
            eventDetails.editableElement = targetElement;

            appendFieldPathDropdown(eventDetails, focusedToolbarElement);
            expect(spyAppendChild).toHaveBeenCalledWith(expect.any(DocumentFragment));
        });

        it("should position the toolbar correctly based on target element dimensions", () => {
            const targetElement = document.createElement("div");
            targetElement.getBoundingClientRect = vi.fn(() => ({
                top: 100,
                left: 100,
                right: 200,
                height: 50,
            } as DOMRect));
            eventDetails.editableElement = targetElement;

            appendFieldPathDropdown(eventDetails, focusedToolbarElement);

            expect(focusedToolbarElement.style.top).toBe("92px");
            expect(focusedToolbarElement.style.left).toBe("98px");
        });

        it("should handle right edge overflow correctly", () => {
            const targetElement = document.createElement("div");
            targetElement.getBoundingClientRect = vi.fn(() => ({
                top: 100,
                left: window.innerWidth - 50,
                right: window.innerWidth - 10,
                height: 50,
            } as DOMRect));
            eventDetails.editableElement = targetElement;

            appendFieldPathDropdown(eventDetails, focusedToolbarElement);

            expect(focusedToolbarElement.style.justifyContent).toBe("flex-end");
            expect(focusedToolbarElement.style.left).toBe(`${targetElement.getBoundingClientRect().right + LIVE_PREVIEW_OUTLINE_WIDTH_IN_PX}px`);
        });
    });
});