import React, { useMemo } from "preact/compat";
import { IMessageDTO, IUserState } from "../../../types/collab.types";
import {
    getMessageWithDisplayName,
    sanitizeData,
} from "../../../utils/collabUtils";
import { collabStyles } from "../../../visualBuilder.style";

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
            data-testid={"collab-discussion-comment--message"}
            className={collabStyles()["collab-discussion-comment--message"]}
            dangerouslySetInnerHTML={{ __html: sanitizedText }}
        ></div>
    );
};

export default CommentResolvedText;
