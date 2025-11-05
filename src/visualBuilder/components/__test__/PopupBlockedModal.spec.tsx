import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/preact";
import { PopupBlockedModal } from "../PopupBlockedModal";

describe("PopupBlockedModal", () => {
    it("should not render when isOpen is false", () => {
        const onClose = vi.fn();
        const { container } = render(
            <PopupBlockedModal isOpen={false} onClose={onClose} />
        );

        expect(container.querySelector("[data-testid='popup-blocked-modal']")).toBeNull();
    });

    it("should render when isOpen is true", () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        const modal = screen.getByTestId("popup-blocked-modal");
        expect(modal).toBeTruthy();
    });

    it("should display the correct title", () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        expect(screen.getByText("Popup Blocked")).toBeTruthy();
    });

    it("should display the main message", () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        expect(
            screen.getByText(
                /Your browser has blocked a popup window/i
            )
        ).toBeTruthy();
    });

    it("should display instructions", () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        expect(screen.getByText(/To enable popups:/i)).toBeTruthy();
    });

    it("should call onClose when close button is clicked", async () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        const closeButton = screen.getByTestId("popup-blocked-modal-close-button");
        fireEvent.click(closeButton);

        await waitFor(
            () => {
                expect(onClose).toHaveBeenCalled();
            },
            { timeout: 500 }
        );
    });

    it("should call onClose when backdrop is clicked", async () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        const backdrop = screen.getByTestId("popup-blocked-modal-backdrop");
        fireEvent.click(backdrop);

        await waitFor(
            () => {
                expect(onClose).toHaveBeenCalled();
            },
            { timeout: 500 }
        );
    });

    it("should not call onClose when modal content is clicked", () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        const modal = screen.getByTestId("popup-blocked-modal");
        fireEvent.click(modal);

        // onClose should not be called immediately
        expect(onClose).not.toHaveBeenCalled();
    });

    it("should apply visible class after mounting", async () => {
        const onClose = vi.fn();
        render(<PopupBlockedModal isOpen={true} onClose={onClose} />);

        const backdrop = screen.getByTestId("popup-blocked-modal-backdrop");

        await waitFor(
            () => {
                expect(
                    backdrop.className.includes(
                        "popup-blocked-modal__backdrop--visible"
                    )
                ).toBe(true);
            },
            { timeout: 100 }
        );
    });
});

