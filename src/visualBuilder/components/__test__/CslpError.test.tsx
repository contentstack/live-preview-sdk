/**
 * @vitest-environment jsdom
 */

/** @jsxImportSource preact */
import { render, fireEvent, waitFor } from "@testing-library/preact";
import { vi } from "vitest";
import { CslpError } from "../CslpError";
import { visualBuilderStyles } from "../visualBuilder.style";

vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => ({
        "visual-builder__focused-toolbar__error": "error-class",
        "visual-builder__focused-toolbar__error-text": "error-text-class",
        "visual-builder__focused-toolbar__error-toolip": "error-tooltip-class",
    })),
}));

vi.mock("../icons", () => ({
    WarningOctagonIcon: () => <div data-testid="warning-icon">Warning</div>,
}));

describe("CslpError", () => {
    it("should render error component with icon and text", () => {
        const { getByText, getByTestId } = render(<CslpError />);

        expect(getByTestId("warning-icon")).toBeInTheDocument();
        expect(getByText("Error")).toBeInTheDocument();
    });

    it("should show tooltip on mouseenter and hide on mouseleave", async () => {
        const { container, queryByText } = render(<CslpError />);

        // Find the error element by its ref (it will have the error class)
        const errorElement = container.querySelector(
            '[class*="visual-builder__focused-toolbar__error"]'
        ) || container.firstElementChild;

        expect(queryByText("Invalid CSLP tag")).not.toBeInTheDocument();

        fireEvent.mouseEnter(errorElement!);

        await waitFor(() => {
            expect(queryByText("Invalid CSLP tag")).toBeInTheDocument();
            expect(
                queryByText("The CSLP is invalid or incorrectly generated.")
            ).toBeInTheDocument();
        });

        fireEvent.mouseLeave(errorElement!);

        await waitFor(() => {
            expect(queryByText("Invalid CSLP tag")).not.toBeInTheDocument();
        });
    });
});

