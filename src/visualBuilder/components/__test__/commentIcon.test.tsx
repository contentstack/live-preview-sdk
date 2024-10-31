import { render, screen, waitFor, fireEvent } from "@testing-library/preact";

import { CslpData } from "../../../cslp/types/cslp.types";
import { ISchemaFieldMap } from "../../utils/types/index.types";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { getDiscussionIdByFieldMetaData } from "../../utils/getDiscussionIdByFieldMetaData";
import { Mock, vi } from "vitest";
import CommentIcon, { IActiveDiscussion } from "../CommentIcon";

// Mock dependencies
vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
        on: vi.fn(),
    },
}));

vi.mock("../../utils/getDiscussionIdByFieldMetaData", () => ({
    getDiscussionIdByFieldMetaData: vi
        .fn()
        .mockResolvedValue({ uid: "discussionId" }),
}));

// Mock data
const mockFieldMetadata: CslpData = {
    entry_uid: "entry1",
    content_type_uid: "contentType1",
    fieldPathWithIndex: "fieldPath1",
    cslpValue: "fieldPath1",
    locale: "en-us",
    variant: "",
    fieldPath: "",
    instance: {
        fieldPathWithIndex: "",
    },
    multipleFieldMetadata: {
        index: 1,
        parentDetails: null,
    },
};

const mockFieldSchema: ISchemaFieldMap = {
    uid: "uid",
    display_name: "Label",
    mandatory: false,
    multiple: false,
    non_localizable: false,
    unique: false,
    data_type: "text",
    field_metadata: {
        description: "Label field",
        default_value: "",
        version: 21,
    },
    format: "string",
    error_messages: {
        format: "string",
    },
};

describe("CommentIcon", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("renders loading icon when fetching discussion", async () => {
        render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );

        expect(
            screen.getByTestId(
                "visual-builder__focused-toolbar__multiple-field-toolbar__comment-button-loading"
            )
        ).toBeInTheDocument();

        await waitFor(() => {
            expect(getDiscussionIdByFieldMetaData).toHaveBeenCalledWith({
                fieldMetadata: mockFieldMetadata,
                fieldSchema: mockFieldSchema,
            });
        });
    });

    test("renders AddCommentIcon when no discussion exists", async () => {
        (getDiscussionIdByFieldMetaData as Mock).mockResolvedValueOnce({
            uid: "new",
        });

        render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );

        await waitFor(() => {
            expect(
                screen.getByTestId(
                    "visual-builder__focused-toolbar__multiple-field-toolbar__comment-button"
                )
            ).toBeInTheDocument();
            expect(screen.getByRole("button")).toHaveAttribute(
                "data-tooltip",
                "Add comment"
            );
        });
    });


    test("renders ReadCommentIcon when a discussion exists", async () => {
        const existingDiscussion: IActiveDiscussion = { uid: "discussionId" };
        (getDiscussionIdByFieldMetaData as Mock).mockResolvedValueOnce(
            existingDiscussion
        );

        render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );

        await waitFor(() => {
            expect(
                screen.getByTestId(
                    "visual-builder__focused-toolbar__multiple-field-toolbar__comment-button"
                )
            ).toBeInTheDocument();
        });
    });

    test("should not render when discussionId is null", async () => {
        (getDiscussionIdByFieldMetaData as Mock).mockResolvedValueOnce(null);

        render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );
        await waitFor(() => {
            expect(
                screen.queryByTestId(
                    "visual-builder__focused-toolbar__multiple-field-toolbar__comment-button-loading"
                )
            ).not.toBeInTheDocument();
        });
    });

    test("sends OPEN_FIELD_COMMENT_MODAL event on button click", async () => {
        render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );

        await waitFor(() => {
            expect(screen.getByRole("button")).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole("button"));

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith(
            VisualBuilderPostMessageEvents.OPEN_FIELD_COMMENT_MODAL,
            expect.objectContaining({ fieldMetadata: mockFieldMetadata })
        );
    });

    test("unregisters the event listener on unmount", () => {
        const unregisterMock = vi.fn();
        (visualBuilderPostMessage?.on as Mock).mockReturnValue({
            unregister: unregisterMock,
        });

        const { unmount } = render(
            <CommentIcon
                fieldMetadata={mockFieldMetadata}
                fieldSchema={mockFieldSchema}
            />
        );
        unmount();

        expect(unregisterMock).toHaveBeenCalled();
    });

    test("updates activeDiscussion when receiving valid discussion data", async () => {
        // Prepare mock discussion event data
        const discussionData: IActiveDiscussion = { uid: "existingDiscussionId" };
        const receiveData = {
            data: {
                discussion: discussionData,
                entryId: mockFieldMetadata.entry_uid,
                contentTypeId: mockFieldMetadata.content_type_uid,
                fieldUID: "uid",
                fieldPath: mockFieldMetadata.fieldPathWithIndex,
            },
        };

        // Mock the `on` method to simulate receiving a discussion event
        (visualBuilderPostMessage?.on as Mock).mockImplementation((event, callback) => {
            if (event === VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID) {
                callback(receiveData);
            }
            return { unregister: vi.fn() };
        });

        render(<CommentIcon fieldMetadata={mockFieldMetadata} fieldSchema={mockFieldSchema} />);

        // Check if activeDiscussion is updated with received discussion data
        await waitFor(() => {
            expect(screen.getByTestId("visual-builder__focused-toolbar__multiple-field-toolbar__comment-button")).toBeInTheDocument();
        });
    });

    test("does not update activeDiscussion when entryId does not match", async () => {
        // Prepare mock event data with a different entryId
        const receiveData = {
            data: {
                discussion: { uid: "existingDiscussionId" },
                entryId: "nonMatchingEntryId",
                contentTypeId: mockFieldMetadata.content_type_uid,
                fieldUID: "uid",
                fieldPath: mockFieldMetadata.fieldPathWithIndex,
            },
        };

        (visualBuilderPostMessage?.on as Mock).mockImplementation((event, callback) => {
            if (event === VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID) {
                callback(receiveData);
            }
            return { unregister: vi.fn() };
        });

        render(<CommentIcon fieldMetadata={mockFieldMetadata} fieldSchema={mockFieldSchema} />);

        await waitFor(() => {
            expect(
                screen.queryByTestId("visual-builder__focused-toolbar__multiple-field-toolbar__comment-button")
            ).not.toBeInTheDocument();
        });
    });

    test("does not update activeDiscussion when fieldPath does not match", async () => {
        // Prepare mock event data with a different fieldPath
        const receiveData = {
            data: {
                discussion: { uid: "existingDiscussionId" },
                entryId: mockFieldMetadata.entry_uid,
                contentTypeId: mockFieldMetadata.content_type_uid,
                fieldUID: "uid",
                fieldPath: "nonMatchingFieldPath",
            },
        };

        (visualBuilderPostMessage?.on as Mock).mockImplementation((event, callback) => {
            if (event === VisualBuilderPostMessageEvents.UPDATE_DISCUSSION_ID) {
                callback(receiveData);
            }
            return { unregister: vi.fn() };
        });

        render(<CommentIcon fieldMetadata={mockFieldMetadata} fieldSchema={mockFieldSchema} />);

        await waitFor(() => {
            expect(
                screen.queryByTestId("visual-builder__focused-toolbar__multiple-field-toolbar__comment-button")
            ).not.toBeInTheDocument();
        });
    });
});
