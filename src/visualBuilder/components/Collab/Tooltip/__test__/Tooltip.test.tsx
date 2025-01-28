/** @jsxImportSource preact */
import {
    render,
    screen,
    fireEvent,
    act,
    waitFor,
} from "@testing-library/preact";
import Tooltip from "../Tooltip";

describe("Tooltip Component", () => {
    it("renders tooltip with content", async () => {
        const tooltipContent = "This is a tooltip";

        render(
            <Tooltip content={tooltipContent} testId="collab-tooltip">
                <button>Hover me</button>
            </Tooltip>
        );

        const tooltip = screen.getByTestId("collab-tooltip");

        act(() => {
            fireEvent.mouseEnter(tooltip);
        });

        await waitFor(() => {
            const tooltipElement = screen.getByRole("tooltip");
            expect(tooltipElement).toBeInTheDocument();
            expect(tooltipElement).toHaveTextContent(tooltipContent);
        });
    });

    it("positions the tooltip correctly based on position prop", async () => {
        const tooltipContent = "This is a tooltip";

        render(
            <Tooltip
                content={tooltipContent}
                position="top"
                testId="collab-tooltip"
            >
                <button>Hover me</button>
            </Tooltip>
        );

        const tooltip = screen.getByTestId("collab-tooltip");

        act(() => {
            fireEvent.mouseEnter(tooltip);
        });

        await waitFor(() => {
            const tooltipElement = screen.getByRole("tooltip");
            expect(tooltipElement).toBeInTheDocument();
            expect(tooltipElement).toHaveTextContent(tooltipContent);
        });

        const tooltipElement = screen.getByRole("tooltip");
        expect(tooltipElement).toHaveStyle("top: -8px");
    });

    it("uses the default position 'bottom' if no position prop is passed", async () => {
        const tooltipContent = "This is a tooltip";

        render(
            <Tooltip content={tooltipContent} testId="collab-tooltip">
                <button>Hover me</button>
            </Tooltip>
        );

        const tooltip = screen.getByTestId("collab-tooltip");

        act(() => {
            fireEvent.mouseEnter(tooltip);
        });

        await waitFor(() => {
            const tooltipElement = screen.getByRole("tooltip");
            expect(tooltipElement).toBeInTheDocument();
            expect(tooltipElement).toHaveTextContent(tooltipContent);
        });

        const tooltipElement = screen.getByRole("tooltip");
        expect(tooltipElement).toHaveStyle("top: 8px");
    });

    it("shows tooltip on mouse enter and hides on mouse leave", async () => {
        const tooltipContent = "This is a tooltip";

        render(
            <Tooltip content={tooltipContent} testId="collab-tooltip">
                <button>Hover me</button>
            </Tooltip>
        );

        const tooltip = screen.getByTestId("collab-tooltip");

        act(() => {
            fireEvent.mouseEnter(tooltip);
        });

        await waitFor(() => {
            const tooltipElement = screen.getByRole("tooltip");
            expect(tooltipElement).toBeInTheDocument();
        });

        act(() => {
            fireEvent.mouseLeave(tooltip);
        });

        await waitFor(() => {
            const tooltipElement = screen.queryByRole("tooltip");
            expect(tooltipElement).not.toBeInTheDocument();
        });
    });
});
