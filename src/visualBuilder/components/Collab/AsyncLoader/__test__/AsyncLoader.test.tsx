/** @jsxImportSource preact */
import { render, screen } from "@testing-library/preact";
import AsyncLoader from "../AsyncLoader";

describe("AsyncLoader", () => {
    it("renders with default primary color when no color is provided", () => {
        const { container } = render(<AsyncLoader testId="test" />);

        expect(
            container.querySelector(".collab-button--loading--primary")
        ).not.toBeNull();
        expect(
            container.querySelectorAll(".collab-button--loader--animation")
                .length
        ).toBe(3);
        expect(screen.getByTestId("test")).toBeInTheDocument();
    });

    it("renders with secondary color when specified", () => {
        const { container } = render(
            <AsyncLoader color="secondary" testId="test" />
        );

        expect(
            container.querySelector(".collab-button--loading--secondary")
        ).not.toBeNull();
        expect(screen.getByTestId("test")).toBeInTheDocument();
    });

    it("renders with tertiary color when specified", () => {
        const { container } = render(
            <AsyncLoader color="tertiary" testId="test" />
        );

        expect(
            container.querySelector(".collab-button--loading--tertiary")
        ).not.toBeNull();
    });

    it("renders with destructive color when specified", () => {
        const { container } = render(
            <AsyncLoader color="destructive" testId="test" />
        );

        expect(
            container.querySelector(".collab-button--loading--destructive")
        ).not.toBeNull();
    });

    it("applies custom className when provided", () => {
        const { container } = render(
            <AsyncLoader className="custom-class" testId="test" />
        );

        expect(container.querySelector(".custom-class")).not.toBeNull();
        expect(
            container.querySelector(".collab-button--loader.custom-class")
        ).not.toBeNull();
    });

    it("uses default testId when none is provided", () => {
        render(<AsyncLoader />);

        expect(screen.getByTestId("collab-async-loader")).toBeInTheDocument();
    });

    it("spreads additional props to the wrapper div", () => {
        render(<AsyncLoader data-foo="bar" aria-label="Loading" />);

        const wrapper = screen.getByTestId("collab-async-loader");
        expect(wrapper).toHaveAttribute("data-foo", "bar");
        expect(wrapper).toHaveAttribute("aria-label", "Loading");
    });

    it("renders all three loader dots with correct classes", () => {
        const { container } = render(<AsyncLoader />);

        const loaderDots = container.querySelectorAll(
            ".collab-button--loader--animation"
        );
        expect(loaderDots.length).toBe(3);

        loaderDots.forEach((dot) => {
            expect(dot).toHaveClass("collab-button--loading--primary");
        });
    });

    it("combines custom class with color variant", () => {
        const { container } = render(
            <AsyncLoader className="custom-class" color="destructive" />
        );

        const wrapper = container.querySelector(".collab-button--loader");
        expect(wrapper).toHaveClass("custom-class");

        const dots = container.querySelectorAll(
            ".collab-button--loader--animation"
        );
        dots.forEach((dot) => {
            expect(dot).toHaveClass("collab-button--loading--destructive");
        });
    });

    it("maintains accessibility attributes", () => {
        render(<AsyncLoader aria-label="Loading content" />);

        const loader = screen.getByTestId("collab-async-loader");
        expect(loader).toHaveAttribute("aria-label", "Loading content");
    });
});
