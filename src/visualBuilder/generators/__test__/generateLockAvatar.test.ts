import { describe, it, expect, beforeEach, vi } from "vitest";
import { showLockAvatar, hideLockAvatar } from "../generateLockAvatar";
import { visualBuilderStyles } from "../../visualBuilder.style";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: { send: vi.fn(), on: vi.fn() },
}));

const hiddenClass = () =>
    visualBuilderStyles()["visual-builder__lock-avatar--hidden"];

const lock = {
    user: { uid: "u1", name: "Ada Lovelace", initials: "AL", avatarColor: "#c2410c" },
    ttl: "2030-01-01",
    isLocked: true,
    isOwn: false,
};

beforeEach(() => {
    document.body.innerHTML = "";
    const avatar = document.createElement("div");
    avatar.className = `visual-builder__lock-avatar ${hiddenClass()}`;
    document.body.appendChild(avatar);
});

describe("lock avatar overlay", () => {
    it("shows the avatar with initials, colour, title, and unhides it", () => {
        const target = document.createElement("div");
        document.body.appendChild(target);

        showLockAvatar(target, lock as never);

        const avatar = document.querySelector<HTMLElement>(
            ".visual-builder__lock-avatar"
        )!;
        expect(avatar.textContent).toBe("AL");
        expect(avatar.style.backgroundColor).not.toBe("");
        expect(avatar.getAttribute("title")).toBe("Locked by Ada Lovelace");
        expect(avatar.classList.contains(hiddenClass())).toBe(false);
    });

    it("hides the avatar", () => {
        const avatar = document.querySelector<HTMLElement>(
            ".visual-builder__lock-avatar"
        )!;
        avatar.classList.remove(hiddenClass());

        hideLockAvatar();

        expect(avatar.classList.contains(hiddenClass())).toBe(true);
    });
});
