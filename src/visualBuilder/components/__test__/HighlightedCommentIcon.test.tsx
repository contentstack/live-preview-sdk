/**
 * @vitest-environment jsdom
 */

/** @jsxImportSource preact */
import { render, fireEvent } from "@testing-library/preact";
import { vi } from "vitest";
import HighlightedCommentIcon from "../HighlightedCommentIcon";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import Config from "../../../configManager/configManager";
import { toggleCollabPopup } from "../../generators/generateThread";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../../configManager/configManager", () => ({
    default: {
        get: vi.fn(),
        set: vi.fn(),
    },
}));

vi.mock("../../generators/generateThread", () => ({
    toggleCollabPopup: vi.fn(),
}));

vi.mock("../icons", () => ({
    HighlightCommentIcon: () => (
        <div data-testid="highlight-comment-icon">Icon</div>
    ),
}));

describe("HighlightedCommentIcon", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (Config.get as any).mockReturnValue({
            collab: {
                isFeedbackMode: false,
            },
        });
    });

    it("should render comment icon", () => {
        const mockData = {
            fieldMetadata: { uid: "field-1" },
            discussion: { _id: "discussion-1" },
            fieldSchema: { uid: "schema-1" },
            absolutePath: "test.path",
        };

        const { getByTestId } = render(
            <HighlightedCommentIcon data={mockData} />
        );

        expect(getByTestId("highlight-comment-icon")).toBeInTheDocument();
    });

    it("should handle click and send post message", () => {
        const mockData = {
            fieldMetadata: { uid: "field-1" },
            discussion: { _id: "discussion-1" },
            fieldSchema: { uid: "schema-1" },
            absolutePath: "test.path",
        };

        const { container } = render(
            <HighlightedCommentIcon data={mockData} />
        );

        const iconElement = container.querySelector(".collab-icon");
        fireEvent.click(iconElement!);

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            {
                fieldMetadata: mockData.fieldMetadata,
                discussion: mockData.discussion,
                fieldSchema: mockData.fieldSchema,
                absolutePath: mockData.absolutePath,
            }
        );
        expect(toggleCollabPopup).toHaveBeenCalledWith({
            threadUid: "",
            action: "close",
        });
        expect(Config.set).toHaveBeenCalledWith("collab.isFeedbackMode", true);
    });
});
