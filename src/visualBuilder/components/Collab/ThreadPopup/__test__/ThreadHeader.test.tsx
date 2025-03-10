/** @jsxImportSource preact */
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { vi } from "vitest";
import ThreadHeader from "../ThreadHeader";

describe("ThreadHeader Component", () => {
    const mockOnClose = vi.fn();
    const mockOnResolve = vi.fn();

    const mockResolvePayload = {
        threadUid: "thread-1",
        payload: {
            threadState: 2,
        },
    };

    const mockActiveThread = {
        _id: "thread-1",
        author: "john.doe@example.com",
        inviteUid: "invite-1",
        position: {
            x: 10,
            y: 20,
        },
        elementXPath: "/html/body/div[1]",
        isElementPresent: true,
        pageRoute: "/",
        createdBy: "user1",
        sequenceNumber: 1,
        threadState: 1,
        createdAt: new Date().toISOString(),
    };

    const defaultProps = {
        onClose: mockOnClose,
        displayResolve: true,
        onResolve: mockOnResolve,
        commentCount: 10,
        activeThread: mockActiveThread,
    };

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders the component with the correct title", () => {
        render(<ThreadHeader {...defaultProps} displayResolve={false} />);
        expect(
            screen.getByText(`${defaultProps.commentCount} Comments`)
        ).toBeInTheDocument();
    });

    it("displays the resolve button when displayResolve is true", () => {
        render(<ThreadHeader {...defaultProps} />);

        expect(
            screen.getByTestId("collab-thread-resolve-btn")
        ).toBeInTheDocument();
    });

    it("does not display the resolve button when displayResolve is false", () => {
        render(<ThreadHeader {...defaultProps} displayResolve={false} />);
        expect(screen.queryByTestId("collab-thread-resolve-btn")).toBeNull();
    });
    it("calls onResolve and onClose when the resolve button is clicked", async () => {
        const mockResolveResponse = { notice: "Thread Updated successfully" };
        mockOnResolve.mockResolvedValueOnce(mockResolveResponse);

        render(<ThreadHeader {...defaultProps} />);

        const resolveButton = screen.getByTestId("collab-thread-resolve-btn");
        fireEvent.click(resolveButton);

        await waitFor(
            () => {
                expect(mockOnResolve).toHaveBeenCalledWith(mockResolvePayload);
            },
            { timeout: 2000 }
        );

        await waitFor(
            () => {
                expect(mockOnClose).toHaveBeenCalledWith(true);
            },
            { timeout: 2000 }
        );
    });
});
