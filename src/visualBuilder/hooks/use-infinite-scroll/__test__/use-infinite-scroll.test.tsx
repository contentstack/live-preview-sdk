/** @jsxImportSource preact */
import { render, fireEvent, waitFor } from "@testing-library/preact";
import React from "preact/compat";
import useInfiniteScroll from "../useInfiniteScroll";
import { vi } from "vitest";

// Mocked Test Component
const TestInfiniteScroll: React.FC<{
    loadMore: (offset: number, limit: number) => Promise<void>;
    canFetchMore: boolean;
    isFetching: boolean;
}> = ({ loadMore, canFetchMore, isFetching }) => {
    const containerId = "scroll-container";

    // Use the hook for infinite scroll
    useInfiniteScroll({
        containerId,
        loadMore,
        canFetchMore,
        isFetching,
        offset: 0,
        limit: 10,
    });

    return (
        <div
            id={containerId}
            style={{ height: "100px", overflowY: "scroll", maxHeight: "100px" }}
        >
            <div style={{ height: "2000px" }}>Test</div>
            {/* Mock content to enable scrolling */}
        </div>
    );
};

describe("useInfiniteScroll", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("does not fetch more when isFetching is true", async () => {
        const loadMore = vi.fn();
        const { container } = render(
            <TestInfiniteScroll
                loadMore={loadMore}
                canFetchMore={true}
                isFetching={true}
            />
        );

        const scrollContainer = container.querySelector(
            "#scroll-container"
        ) as HTMLElement;

        // Simulate scroll event to the top
        fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

        // Ensure loadMore is not called when isFetching is true
        await waitFor(() => {
            expect(loadMore).not.toHaveBeenCalled();
        });
    });

    it("calls loadMore when scrolling towards the top and canFetchMore is true", async () => {
        const loadMore = vi.fn().mockResolvedValue(undefined);
        const { container } = render(
            <TestInfiniteScroll
                loadMore={loadMore}
                canFetchMore={true}
                isFetching={false}
            />
        );

        const scrollContainer = container.querySelector(
            "#scroll-container"
        ) as HTMLElement;

        // Scroll to the top
        fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

        // Wait for the loadMore function to be called
        await waitFor(() => {
            expect(loadMore).toHaveBeenCalled();
        });
    });

    it("does not call loadMore when canFetchMore is false", async () => {
        const loadMore = vi.fn();
        const { container } = render(
            <TestInfiniteScroll
                loadMore={loadMore}
                canFetchMore={false}
                isFetching={false}
            />
        );

        const scrollContainer = container.querySelector(
            "#scroll-container"
        ) as HTMLElement;

        // Simulate scroll towards the top
        fireEvent.scroll(scrollContainer, { target: { scrollTop: 0 } });

        // Verify loadMore has not been called
        await waitFor(() => {
            expect(loadMore).not.toHaveBeenCalled();
        });
    });
});
