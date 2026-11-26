/** @jsxImportSource preact */
import { render, fireEvent } from "@testing-library/preact";
import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    afterAll,
    afterEach,
} from "vitest";
import React from "preact/compat";
import { useCommentTextArea } from "../useCommentTextArea";
import { ThreadProvider } from "../../components/Collab/ThreadPopup/ContextProvider";
import { IThreadContext, IUserState } from "../../types/collab.types";

const userState = {
    mentionsList: [{ display: "Ada", id: "u1" }],
    userMap: {},
    currentUser: { uid: "u0", email: "me@example.com" },
} as unknown as IUserState;

const threadContext = {
    error: { hasError: false, message: "" },
    setError: vi.fn(),
    onCreateComment: vi.fn(),
    onEditComment: vi.fn(),
    editComment: null,
    setThreadState: vi.fn(),
    activeThread: null,
    setActiveThread: vi.fn(),
    createNewThread: vi.fn(),
} as unknown as IThreadContext;

function Harness() {
    const { inputRef, handleInputChange, handleKeyDown } = useCommentTextArea(
        userState,
        null,
        vi.fn()
    );
    return (
        <textarea
            data-testid="comment"
            ref={inputRef}
            onInput={handleInputChange as any}
            onKeyDown={handleKeyDown as any}
        />
    );
}

const renderTextArea = () =>
    render(
        <ThreadProvider.Provider value={threadContext}>
            <Harness />
        </ThreadProvider.Provider>
    ).getByTestId("comment") as HTMLTextAreaElement;

const typeText = (textarea: HTMLTextAreaElement, value: string) => {
    textarea.value = value;
    textarea.setSelectionRange(value.length, value.length);
    fireEvent.input(textarea);
};

describe("useCommentTextArea Escape", () => {
    const documentKeydown = vi.fn();

    beforeAll(() => document.addEventListener("keydown", documentKeydown));
    afterAll(() => document.removeEventListener("keydown", documentKeydown));
    afterEach(() => documentKeydown.mockClear());

    it("keeps an Escape that closes the mention list from reaching the page", () => {
        const textarea = renderTextArea();
        typeText(textarea, "Hi @A");

        fireEvent.keyDown(textarea, { key: "Escape", code: "Escape" });

        expect(documentKeydown).not.toHaveBeenCalled();
    });

    it("lets Escape through when the mention search matches no one", () => {
        const textarea = renderTextArea();
        typeText(textarea, "Hi @zzz");

        fireEvent.keyDown(textarea, { key: "Escape", code: "Escape" });

        expect(documentKeydown).toHaveBeenCalledTimes(1);
    });

    it("lets Escape through when no mention list is open", () => {
        const textarea = renderTextArea();
        typeText(textarea, "Hi there");

        fireEvent.keyDown(textarea, { key: "Escape", code: "Escape" });

        expect(documentKeydown).toHaveBeenCalledTimes(1);
    });
});
