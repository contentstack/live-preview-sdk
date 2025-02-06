import {
    getUserName,
    validateCommentAndMentions,
    filterOutInvalidMentions,
    getCommentBody,
    getThreadTitle,
} from "../collabUtils";
import { maxMessageLength, mentionLimit } from "../constants";
import { IMentionedList, IUserDTO } from "../../types/collab.types";

vi.mock("lodash", () => ({
    uniqBy: vi.fn((arr, key) => arr),
}));

describe("Utility Functions", () => {
    describe("getUserName", () => {
        it("should return email of the user", () => {
            const user: IUserDTO = {
                identityHash: "1",
                email: "john.doe@example.com",
            };
            expect(getUserName(user)).toBe("john.doe@example.com");
        });
    });

    describe("validateCommentAndMentions", () => {
        it("should return error message if comment exceeds max length", () => {
            const comment = "a".repeat(1001);
            const toUsers: IMentionedList = [];
            expect(validateCommentAndMentions(comment, toUsers)).toBe(
                `Limit exceeded. You can have a maximum length of ${maxMessageLength} characters.`
            );
        });

        it("should return error message if mentions exceed the limit", () => {
            const comment = "Test comment @John1";
            const toUsers: IMentionedList = new Array(mentionLimit + 1)
                .fill(1)
                .map((value, index) => ({
                    id: `${index + 1}`,
                    display: `John${index + 1}`,
                }));
            expect(validateCommentAndMentions(comment, toUsers)).toBe(
                `Limit exceeded. You can tag a maximum of ${mentionLimit} users.`
            );
        });

        it("should return empty string if comment and mentions are within limits", () => {
            const comment = "Valid comment";
            const toUsers: IMentionedList = [];
            expect(validateCommentAndMentions(comment, toUsers)).toBe("");
        });
    });

    describe("filterOutInvalidMentions", () => {
        it("should filter out users and roles that are not in the message", () => {
            const message = "Hello @JohnDoe";
            const toUsers = [
                { id: "1", display: "@JohnDoe" },
                { id: "2", display: "@Doe" },
            ];

            const result = filterOutInvalidMentions(message, toUsers);
            expect(result.toUsers).toEqual([{ id: "1", display: "@JohnDoe" }]);
        });
    });

    describe("getCommentBody", () => {
        it("should replace mentions with their unique identifiers", () => {
            const state = {
                message: "Hello @JohnDoe",
                toUsers: [{ id: "1", display: "@JohnDoe" }],
                createdBy: "1",
                author: "john.doe@example.com",
            };
            const result = getCommentBody(state);
            expect(result.message).toBe("Hello {{1}}");
            expect(result.toUsers).toEqual(["1"]);
        });

        it("should trim the message and replace multiple spaces with a single space", () => {
            const state = {
                message: "   Hello   @JohnDoe   and   @JaneDoe    ",
                toUsers: [
                    { id: "1", display: "@JohnDoe" },
                    { id: "2", display: "@JaneDoe" },
                ],
                createdBy: "1",
                author: "john.doe@example.com",
            };
            const result = getCommentBody(state);
            expect(result.message).toBe("Hello {{1}} and {{2}}");
            expect(result.toUsers).toEqual(["1", "2"]);
        });
    });

    describe("getThreadTitle", () => {
        it('should return "Add New Feedback" when the comment count is 0', () => {
            const result = getThreadTitle(0);
            expect(result).toBe("Add New Feedback");
        });

        it('should return "1 Feedback" when the comment count is 1', () => {
            const result = getThreadTitle(1);
            expect(result).toBe("1 Feedback");
        });

        it('should return "{commentCount} Comments" when the comment count is greater than 1', () => {
            const result = getThreadTitle(5);
            expect(result).toBe("5 Feedbacks");
        });

        it("should handle edge cases with large numbers", () => {
            const result = getThreadTitle(1000);
            expect(result).toBe("1000 Feedbacks");
        });
    });
});
