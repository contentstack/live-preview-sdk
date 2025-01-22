/** @jsxImportSource preact */
import { render, screen, fireEvent } from "@testing-library/preact";
import Icon, {IconProps} from "../Icon";
import { vi } from "vitest";

// Mock the iconComponents to test rendering without relying on actual icons
// vi.mock("../../icons/index", () => {
//     return {
//         iconComponents: {
//             testIcon: ({ className }: { className?: string }) => (
//                 <svg className={className} data-testid="test-icon" />
//             ),
//         },
//     };
// });

describe("Icon Component", () => {
    it("renders the Icon without tooltip", () => {
        render(<Icon icon="Cancel" />);
        const icon = screen.getByTestId("collab-icon");
        expect(icon).toBeInTheDocument();
        // expect(icon).toHaveClass("collab-icon");
    });

    // it("renders the Icon with a custom className", () => {
    //     render(<Icon icon={"testIcon" as any} className="custom-class" />);
    //     const icon = screen.getByTestId("collab-icon");
    //     expect(icon).toHaveClass("custom-class");
    // });

    // it("renders the Icon with tooltip", () => {
    //     render(
    //         <Icon
    //            icon={"testIcon" as any}
    //             tooltipContent="Test Tooltip"
    //             withTooltip
    //         />
    //     );
    //     const icon = screen.getByTestId("collab-icon-tooltip");
    //     expect(icon).toBeInTheDocument();
    // });

    // it("displays the tooltip when hovering over the Icon", async () => {
    //     render(
    //         <Icon
    //             icon={"testIcon" as any}
    //             tooltipContent="Test Tooltip"
    //             withTooltip
    //         />
    //     );
    //     const icon = screen.getByTestId("collab-icon-tooltip");

    //     // Simulate hover
    //     fireEvent.mouseOver(icon);

    //     // Assuming the tooltip content appears after hover
    //     const tooltipContent = screen.getByText("Test Tooltip");
    //     expect(tooltipContent).toBeInTheDocument();
    // });

    // it("fires onClick event when the Icon is clicked", () => {
    //     const onClickMock = vi.fn();
    //     render(
    //         <Icon
    //             icon={"testIcon" as any}
    //             onClick={onClickMock}
    //         />
    //     );
    //     const icon = screen.getByTestId("collab-icon");

    //     // Simulate click
    //     fireEvent.click(icon);

    //     // Verify the click handler was called
    //     expect(onClickMock).toHaveBeenCalledTimes(1);
    // });
});
