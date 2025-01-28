import React from "preact/compat";
import { useEffect, useState } from "preact/hooks";

interface IUseInfiniteScrollOptions {
    containerId: string;
    isFetching: boolean;
    canFetchMore: boolean;
    loadMore: (offset: number, limit: number) => Promise<any>;
    offset: number;
    limit: number;
}

const scrollOffset = 3;

const useInfiniteScroll = ({
    containerId,
    isFetching,
    canFetchMore,
    loadMore,
    offset,
    limit,
}: IUseInfiniteScrollOptions) => {
    const [fetchingState, setFetchingState] = useState(isFetching);

    useEffect(() => {
        const commentListContainer = document.getElementById(containerId);
        if (!commentListContainer) return;

        const scrollEvent = async () => {
            if (
                commentListContainer.scrollHeight +
                    commentListContainer.scrollTop -
                    commentListContainer.clientHeight <
                    scrollOffset && // Adjust this offset if needed
                !fetchingState &&
                canFetchMore
            ) {
                setFetchingState(true);
                try {
                    await loadMore(offset, limit);
                } finally {
                    setFetchingState(false);
                }
            }
        };

        commentListContainer.addEventListener("scroll", scrollEvent, true);
        return () => {
            commentListContainer.removeEventListener(
                "scroll",
                scrollEvent,
                true
            );
        };
    }, [containerId, fetchingState, canFetchMore, loadMore, offset, limit]);

    return fetchingState;
};

export default useInfiniteScroll;
