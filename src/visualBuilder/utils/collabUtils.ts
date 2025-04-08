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
import dayjs from "dayjs";

const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Generates the title for the thread based on the number of comments.
 * @param {number} commentCount - The number of comments.
 * @returns {string} The title for the thread.
 */
export const getThreadTitle = (commentCount: number): string => {
    if (commentCount === 0) return "Add New Comment";
    return commentCount === 1 ? "1 Comment" : `${commentCount} Comments`;
};

/**
 * returns the available email.
 * @param {IUserDTO} user - The user object.
 * @returns {string} The user's email.
 */
export const getUserName = (user: IUserDTO): string => {
    return user.firstName && user.lastName
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || user.email;
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

    let tempText = sanitizeData(comment.message).replace(/<[^>]*>/g, "");

    comment?.toUsers?.forEach((user) => {
        const userPattern = new RegExp(`{{${user}}}`, "g");
        const userData = userState.userMap[user];
        const replacement =
            profile === "html"
                ? `<b class="collab-thread-comment--message">@${userData.display || getUserName(userData)}</b>`
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
    let finalMessage = sanitizeData(state.message)
        .replace(/[^\S\r\n]+/g, " ")
        .replace(/ *\n */g, "\n")
        .replace(/<[^>]*>/g, "")
        .trim();

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

        const escapedDisplayName = escapeRegExp(`@${displayName}`);
        const regexUser = new RegExp(escapedDisplayName, "g");
        finalMessage = finalMessage.replace(regexUser, `{{${entity.id}}}`);
        result.push(entity.id);
    };

    state.toUsers?.forEach((user) => updateMentionToUID(user, comment.toUsers));

    comment.message = finalMessage;
    return comment;
};

export function normalizePath(path: string): string {
    if (path === "/") return path;
    return path.endsWith("/") ? path.slice(0, -1) : path;
}

export function fixSvgXPath(xpath: string | null): string {
    if (!xpath) return "";
    return xpath.replace(/\/svg/g, "/*[name()='svg']");
}

/**
 * populate the position of the thread based on edges of the screen.
 * @param position
 * @param options
 * @returns
 */
export function adjustPositionToViewport(
    position: { top: number; left: number },
    options: {
        threadWidth?: number;
        safeMargin?: number;
        topSafeMargin?: number;
    } = {}
): { top: number; left: number } {
    const { top, left } = position;
    const viewportWidth = window.innerWidth;
    const safeMargin = options.safeMargin ?? 16;
    const topSafeMargin = options.topSafeMargin ?? 42;
    const threadWidth = options.threadWidth ?? 16;

    let adjustedLeft = left;
    let adjustedTop = top;

    // Adjust position if too close to right edge
    if (adjustedLeft + threadWidth > viewportWidth - safeMargin) {
        adjustedLeft = viewportWidth - safeMargin - threadWidth;
    }

    // Adjust position if too close to top edge
    if (adjustedTop - window.scrollY < topSafeMargin) {
        adjustedTop = window.scrollY + topSafeMargin;
    }

    return { top: adjustedTop, left: adjustedLeft };
}

export function formatDate(dateString: string): string {
    if (!dateString) return "";
    return dayjs(dateString).format("MMM DD, YYYY, hh:mm A");
}

interface PositionCoords {
    top: number;
    left: number;
}

interface Positions {
    bottom: PositionCoords;
    top: PositionCoords;
    left: PositionCoords;
    right: PositionCoords;
}

/**
 * Calculates and updates tooltip position based on available viewport space.
 */
export const positionTooltip = (
    tooltipRef: React.RefObject<HTMLDivElement>,
    targetRef: React.RefObject<HTMLDivElement>,
    position: "top" | "bottom" | "left" | "right",
    setActualPosition: (position: "top" | "bottom" | "left" | "right") => void
) => {
    if (!tooltipRef.current || !targetRef.current) return;

    const targetRect = targetRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;

    const positions: Positions = {
        bottom: {
            top: targetRect.bottom + margin,
            left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        },
        top: {
            top: targetRect.top - tooltipRect.height - margin,
            left: targetRect.left + (targetRect.width - tooltipRect.width) / 2,
        },
        left: {
            top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
            left: targetRect.left - tooltipRect.width - margin,
        },
        right: {
            top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
            left: targetRect.right + margin,
        },
    };

    let bestPosition = position;
    let coords = positions[position];

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    const wouldBeOutsideViewport = {
        bottom: coords.top + tooltipRect.height > viewportHeight,
        top: coords.top < 0,
        left: coords.left < 0,
        right: coords.left + tooltipRect.width > viewportWidth,
    };

    const horizontalOutOfBounds =
        coords.left < 0 || coords.left + tooltipRect.width > viewportWidth;

    if (wouldBeOutsideViewport[position] || horizontalOutOfBounds) {
        const positionPriority = ["bottom", "top", "right", "left"];

        positionPriority.splice(positionPriority.indexOf(position), 1);
        positionPriority.push(position);

        for (const pos of positionPriority) {
            const testCoords = positions[pos as keyof Positions];

            const isVisible =
                testCoords.top >= 0 &&
                testCoords.top + tooltipRect.height <= viewportHeight &&
                testCoords.left >= 0 &&
                testCoords.left + tooltipRect.width <= viewportWidth;

            if (isVisible) {
                bestPosition = pos as "top" | "bottom" | "left" | "right";
                coords = testCoords;
                break;
            }
        }
    }

    if (coords.left < 0) {
        coords.left = margin;
    } else if (coords.left + tooltipRect.width > viewportWidth) {
        coords.left = viewportWidth - tooltipRect.width - margin;
    }

    if (coords.top < 0) {
        coords.top = margin;
    } else if (coords.top + tooltipRect.height > viewportHeight) {
        coords.top = viewportHeight - tooltipRect.height - margin;
    }

    setActualPosition(bestPosition);

    Object.assign(tooltipRef.current.style, {
        top: `${coords.top}px`,
        left: `${coords.left}px`,
    });
};
