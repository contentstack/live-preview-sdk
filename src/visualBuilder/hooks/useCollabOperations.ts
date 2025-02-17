/** @jsxImportSource preact */
import React from "preact/compat";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import {
    ICommentResponse,
    IThreadResponseDTO,
    IDefaultAPIResponse,
    IFetchCommentsResponse,
    ICommentPayload,
    IEditCommentArgs,
    IDeleteCommentArgs,
    IThreadResolveArgs,
    IFetchComments,
    IThreadPayload,
    IInviteMetadata,
    IDeleteThreadArgs,
} from "../types/collab.types";
import { removeCollabIcon } from "../generators/generateThread";
import Config from "../../configManager/configManager";

export const useCollabOperations = () => {
    const createComment = async (payload: ICommentPayload) => {
        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_CREATE_COMMENT,
            { payload }
        )) as ICommentResponse;
        if (!data) throw new Error("Failed to create comment");
        return data;
    };

    const editComment = async (payload: IEditCommentArgs) => {
        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_EDIT_COMMENT,
            { payload }
        )) as ICommentResponse;
        if (!data) throw new Error("Failed to update comment");
        return data;
    };

    const deleteComment = async (payload: IDeleteCommentArgs) => {
        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_DELETE_COMMENT,
            { payload }
        )) as IDefaultAPIResponse;
        if (!data) throw new Error("Failed to delete comment");
        return data;
    };

    const resolveThread = async (payload: IThreadResolveArgs) => {
        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_RESOLVE_THREAD,
            { payload }
        )) as IThreadResponseDTO;
        if (!data) throw new Error("Failed to resolve thread");
        return data;
    };

    const fetchComments = async (payload: IFetchComments) => {
        return (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_FETCH_COMMENTS,
            { payload }
        )) as IFetchCommentsResponse;
    };

    const createNewThread = async (
        buttonRef: React.RefObject<HTMLButtonElement>,
        inviteMetadata: IInviteMetadata
    ) => {
        if (!buttonRef.current) {
            throw new Error("Button ref not found");
        }

        const parentDiv = buttonRef.current.closest("div[field-path]");

        if (!parentDiv) {
            throw new Error("Count not find parent div");
        }

        const fieldPath = parentDiv.getAttribute("field-path");
        const relative = parentDiv.getAttribute("relative");

        if (!fieldPath || !relative)
            throw new Error("Invalid field attributes");

        const match = relative?.match(/x: ([\d.]+), y: ([\d.]+)/);
        if (!match) {
            throw new Error("Invalid relative attribute");
        }

        const relativeX = parseFloat(match[1]);
        const relativeY = parseFloat(match[2]);

        const payload: IThreadPayload = {
            elementXPath: fieldPath,
            position: { x: relativeX, y: relativeY },
            author: inviteMetadata.currentUser.email,
            pageRoute: window.location.pathname,
            inviteUid: inviteMetadata.inviteUid,
            createdBy: inviteMetadata.currentUser.uid,
        };

        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_CREATE_THREAD,
            { payload }
        )) as IThreadResponseDTO;

        parentDiv.setAttribute("threaduid", data.thread._id);

        return data;
    };

    const deleteThread = async (payload: IDeleteThreadArgs) => {
        const data = (await visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.COLLAB_DELETE_THREAD,
            { payload }
        )) as IDefaultAPIResponse;
        if (!data) throw new Error("Failed to delete thread");
        removeCollabIcon(payload.threadUid);
        const config = Config.get();
        if (config?.collab?.isFeedbackMode === false) {
            Config.set("collab.isFeedbackMode", true);
        }
        return data;
    };

    return {
        createComment,
        editComment,
        deleteComment,
        resolveThread,
        fetchComments,
        createNewThread,
        deleteThread,
    };
};
