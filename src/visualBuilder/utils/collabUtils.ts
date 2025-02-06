import {
    ICommentState,
    IMentionedList,
    IMentionItem,
    IMessageDTO,
    IUserDTO,
    IUserState,
} from "../types/collab.types";
import { maxMessageLength, mentionLimit } from "./constants";
import { uniqBy } from "lodash-es";
import DOMPurify from "dompurify";

const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Generates the title for the thread based on the number of comments.
 * @param {number} commentCount - The number of comments.
 * @returns {string} The title for the thread.
 */
export const getThreadTitle = (commentCount: number): string => {
    if (commentCount === 0) return "Add New Feedback";
    return commentCount === 1 ? "1 Feedback" : `${commentCount} Feedbacks`;
};

/**
 * returns the available email.
 * @param {IUserDTO} user - The user object.
 * @returns {string} The user's email.
 */
export const getUserName = (user: IUserDTO): string => {
    return user.email;
};

/**
 * Validates the comment length and the number of mentions.
 * @param {string} comment - The comment message.
 * @param {IMentionedList} toUsers - The list of mentioned users.
 * @returns {string} The error message if validation fails, otherwise an empty string.
 */
export const validateCommentAndMentions = (
    comment: string,
    toUsers: IMentionedList
): string => {
    if (comment.length > maxMessageLength) {
        return `Limit exceeded. You can have a maximum length of ${maxMessageLength} characters.`;
    }
    if (toUsers.length > mentionLimit) {
        return `Limit exceeded. You can tag a maximum of ${mentionLimit} users.`;
    }
    return "";
};

/**
 * Removes mentions that no longer exist in the message.
 * @param {string} message - The comment message.
 * @param {IMentionedList} toUsers - The list of mentioned users.
 * @returns {Object} The updated lists of mentioned users.
 */
export const filterOutInvalidMentions = (
    message: string,
    toUsers: IMentionedList
) => {
    const to_users_temp = toUsers.filter((user) =>
        message.includes(user.display)
    );

    return {
        toUsers: uniqBy(to_users_temp, "id"),
    };
};

/**
 * Replaces mention placeholders with display names in the comment message.
 * @param {IMessageDTO | undefined} comment - The comment object.
 * @param {IUserState} userState - The user state containing user and role maps.
 * @param {"text" | "html"} profile - The format for the output message, either plain text or HTML.
 * @returns {string | undefined} The formatted message or undefined if the comment is not provided.
 */
export const getMessageWithDisplayName = (
    comment: IMessageDTO | undefined | null,
    userState: IUserState,
    profile: "text" | "html"
): string | undefined => {
    if (!comment) return undefined;

    let tempText = comment.message;

    comment?.toUsers?.forEach((user) => {
        const userPattern = new RegExp(`{{${user}}}`, "g");
        const userData = userState.userMap[user];
        const replacement =
            profile === "html"
                ? `<b>@${userData.display || getUserName(userData)}</b>`
                : `@${userData.display || getUserName(userData)}`;
        tempText = tempText.replace(userPattern, replacement);
    });

    return tempText;
};

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * @param {any} dirty - The unsanitized HTML content.
 * @returns {string} The sanitized HTML content.
 */
export const sanitizeData = (dirty: any): string => {
    return DOMPurify.sanitize(dirty, { USE_PROFILES: { html: true } });
};

/**
 * Constructs the comment body with mentions replaced by their unique identifiers.
 * @param {ICommentState} state - The state containing the comment and mentions.
 * @returns {Object} The comment body containing the sanitized message and mentioned users.
 */
export const getCommentBody = (state: ICommentState): ICommentState => {
    let finalMessage = state.message.trim().replace(/\s+/g, " ");
    const comment = {
        message: finalMessage,
        toUsers: [],
        images: [],
        createdBy: state.createdBy,
        author: state.author,
    };

    const updateMentionToUID = (
        entity: IMentionItem,
        result: Array<string>
    ) => {
        const displayName = entity.display;

        const escapedDisplayName = escapeRegExp(displayName);
        const regexUser = new RegExp(escapedDisplayName, "g");
        finalMessage = finalMessage.replace(regexUser, `{{${entity.id}}}`);
        result.push(entity.display);
    };

    state.toUsers?.forEach((user) => updateMentionToUID(user, comment.toUsers));

    comment.message = finalMessage;
    return comment;
};
