import { visualBuilderStyles } from "../visualBuilder.style";
import { lockAvatarInfo } from "../utils/fieldLockIndicator";
import type { EntryFieldLock } from "../utils/fieldLockStore";

const AVATAR_SIZE = 24;

/**
 * Shows the locking author's avatar at the hovered field's top-left corner,
 * sitting just outside the field border. Reuses the single overlay avatar node
 * (rendered by VisualBuilder), so it follows the hover the same way the hover
 * outline does. Only used on hover of a peer-locked field.
 */
export function showLockAvatar(
    targetElement: Element,
    lock: EntryFieldLock
): void {
    const avatar = document.querySelector<HTMLDivElement>(
        ".visual-builder__lock-avatar"
    );
    if (!avatar) {
        return;
    }
    const rect = targetElement.getBoundingClientRect();
    const { initials, color, name } = lockAvatarInfo(lock);

    avatar.textContent = initials;
    avatar.style.backgroundColor = color;
    avatar.setAttribute(
        "title",
        name ? `Locked by ${name}` : "Locked by another user"
    );
    // Centre the badge on the field's top-left corner so it sits outside the border.
    avatar.style.top = `${rect.top + window.scrollY - AVATAR_SIZE / 2}px`;
    avatar.style.left = `${rect.left - AVATAR_SIZE / 2}px`;
    avatar.classList.remove(
        visualBuilderStyles()["visual-builder__lock-avatar--hidden"]
    );
}

export function hideLockAvatar(): void {
    const avatar = document.querySelector<HTMLDivElement>(
        ".visual-builder__lock-avatar"
    );
    if (!avatar) {
        return;
    }
    avatar.classList.add(
        visualBuilderStyles()["visual-builder__lock-avatar--hidden"]
    );
}
