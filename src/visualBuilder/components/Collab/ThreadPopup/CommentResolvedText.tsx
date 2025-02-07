/** @jsxImportSource preact */
import { useMemo } from "preact/hooks";
import { IMessageDTO, IUserState } from "../../../types/collab.types";
import {
    getMessageWithDisplayName,
    sanitizeData,
} from "../../../utils/collabUtils";
import { collabStyles } from "../../../collab.style";
import classNames from "classnames";

interface ICommentResolvedText {
    comment: IMessageDTO;
    userState: IUserState;
}

const CommentResolvedText = ({ comment, userState }: ICommentResolvedText) => {
    const text = useMemo(() => {
        return getMessageWithDisplayName(comment, userState, "html");
    }, [comment.message, userState.userMap, comment.toUsers]);

    const sanitizedText = useMemo(() => {
        return sanitizeData(text?.replace(/\n/g, "<br/>"));
    }, [text]);

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
