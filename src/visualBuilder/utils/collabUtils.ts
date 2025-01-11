import {
    ICommentState,
    IMentionedList,
    IMentionItem,
    IMessageDTO,
    IUserDTO,
    IUserState,
} from "../types/collab.types";
import { maxMessageLength, mentionLimit } from "./constants";
import { uniqBy } from "lodash";
import DOMPurify from "dompurify";

/**
 * Generates the title for the thread based on the number of comments.
 * @param {number} commentCount - The number of comments.
 * @returns {string} The title for the thread.
 */
export const getDiscussionTitle = (commentCount: number): string => {
    if (commentCount === 0) return "Add New Feedback";
    return commentCount === 1 ? "1 Feedback" : `${commentCount} Feedbacks`;
};

/**
 * Formats the full name of the user. If either first or last name is missing, returns the available name or email.
 * @param {IUserDTO} user - The user object.
 * @returns {string} The user's full name or available identifier.
 */
export const getUserName = (user: IUserDTO): string => {
    return user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.first_name || user.last_name || user.email;
};

/**
 * Validates the comment length and the number of mentions.
 * @param {string} comment - The comment message.
 * @param {IMentionedList} to_roles - The list of mentioned roles.
 * @param {IMentionedList} to_users - The list of mentioned users.
 * @returns {string} The error message if validation fails, otherwise an empty string.
 */
export const validateCommentAndMentions = (
    comment: string,
    to_roles: IMentionedList,
    to_users: IMentionedList
): string => {
    if (comment.length > maxMessageLength) {
        return `Limit exceeded. You can have a maximum length of ${maxMessageLength} characters.`;
    }
    if (to_users.length > mentionLimit || to_roles.length > mentionLimit) {
        return `Limit exceeded. You can tag a maximum of ${mentionLimit} users and ${mentionLimit} roles.`;
    }
    return "";
};

/**
 * Removes mentions that no longer exist in the message.
 * @param {string} message - The comment message.
 * @param {IMentionedList} to_roles - The list of mentioned roles.
 * @param {IMentionedList} to_users - The list of mentioned users.
 * @returns {Object} The updated lists of mentioned users and roles.
 */
export const filterOutInvalidMentions = (
    message: string,
    to_roles: IMentionedList,
    to_users: IMentionedList
) => {
    const to_users_temp = to_users.filter((user) =>
        message.includes(user.display)
    );
    const to_roles_temp = to_roles.filter((role) =>
        message.includes(role.display)
    );

    return {
        to_users: uniqBy(to_users_temp, "id"),
        to_roles: uniqBy(to_roles_temp, "id"),
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

    comment?.to_users?.forEach((user) => {
        const userPattern = new RegExp(`{{${user}}}`, "g");
        const userData = userState.userMap[user];
        const replacement =
            profile === "html"
                ? `<b>@${userData.display || getUserName(userData)}</b>`
                : `@${userData.display || getUserName(userData)}`;
        tempText = tempText.replace(userPattern, replacement);
    });

    comment?.to_roles?.forEach((role) => {
        const rolePattern = new RegExp(`{{${role}}}`, "g");
        const roleData = userState.roleMap[role];
        const replacement =
            profile === "html"
                ? `<b>@${roleData.name}</b>`
                : `@${roleData.name}`;
        tempText = tempText.replace(rolePattern, replacement);
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
 * @returns {Object} The comment body containing the sanitized message and mentioned users/roles.
 */
export const getCommentBody = (state: ICommentState): ICommentState => {
    let finalMessage = state.message;
    const comment = {
        message: finalMessage,
        to_users: [],
        to_roles: [],
    };

    const updateMentionToUID = (
        entity: IMentionItem,
        result: Array<string>
    ) => {
        const displayName = entity.display;
        const regexUser = new RegExp(displayName.replace(/\+/g, "\\+"));
        finalMessage = finalMessage.replace(regexUser, `{{${entity.id}}}`);
        result.push(entity.id);
    };

    state.to_users.forEach((user) =>
        updateMentionToUID(user, comment.to_users)
    );
    state.to_roles.forEach((role) =>
        updateMentionToUID(role, comment.to_roles)
    );

    comment.message = finalMessage;
    return comment;
};
