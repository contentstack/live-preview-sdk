/** @jsxImportSource preact */
import {
    render,
    screen,
    fireEvent,
    waitFor,
    act,
} from "@testing-library/preact";
import Icon from "../Icon";

describe("Icon Component", () => {
    it("renders the Icon without tooltip", async () => {
        render(<Icon icon="Cancel" testId="collab-icon" />);
        const icon = await screen.findByTestId("collab-icon");
        expect(icon).toBeInTheDocument();
    });

    it("renders the Icon with a custom className", () => {
        render(
            <Icon icon="Cancel" testId="collab-icon" className="custom-class" />
        );
        const iconSvg = screen.getByTestId("collab-icon").querySelector("svg");

        expect(iconSvg).toHaveClass("custom-class");
    });

    it("renders the Icon with tooltip", () => {
        render(
            <Icon
                icon="Cancel"
                testId="collab-icon"
                tooltipContent="Cancel"
                withTooltip
            />
        );
        const icon = screen.getByTestId("collab-icon");
        expect(icon).toBeInTheDocument();
    });

    it("displays the tooltip when hovering over the Icon", async () => {
        render(
            <Icon
                icon="Cancel"
                testId="collab-icon"
                tooltipContent="Cancel"
                withTooltip
            />
        );

        const iconWrapper = screen.getByTestId("collab-icon-tooltip");

        act(() => {
            fireEvent.mouseEnter(iconWrapper);
        });

        await waitFor(() => {
            const tooltip = screen.getByRole("tooltip");
            expect(tooltip).toBeInTheDocument();
            expect(tooltip).toHaveTextContent("Cancel");
        });
    });

    it("fires onClick event when the Icon is clicked", () => {
        const onClickMock = vi.fn();

        render(
            <Icon
                icon="Cancel"
                testId="collab-icon"
                tooltipContent="Cancel"
                withTooltip
                onClick={onClickMock}
            />
        );

        const iconWrapper = screen
            .getByTestId("collab-icon")
            .querySelector(".collab-icon-wrapper")!;

        fireEvent.click(iconWrapper);
        expect(onClickMock).toHaveBeenCalledTimes(1);
    });
});
