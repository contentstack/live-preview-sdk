/** @jsxImportSource preact */
import { useMemo } from "preact/hooks";
import { ICommentResolvedText } from "../../../types/collab.types";
import { getMessageWithDisplayName } from "../../../utils/collabUtils";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

const CommentResolvedText = ({ comment, userState }: ICommentResolvedText) => {
    const sanitizedText = useMemo(() => {
        return getMessageWithDisplayName(comment, userState, "html") ?? "";
    }, [comment.message, userState.userMap, comment.toUsers]);

    return (
        <div
            data-testid={"collab-thread-comment--message"}
            className={classNames(
                "collab-thread-comment--message",
                collabStyles()["collab-thread-comment--message"]
            )}
            dangerouslySetInnerHTML={{ __html: sanitizedText }}
        ></div>
    );
};

export default CommentResolvedText;
