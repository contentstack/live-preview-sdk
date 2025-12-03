/**
 * @vitest-environment jsdom
 */

/** @jsxImportSource preact */
import { render, fireEvent, waitFor } from "@testing-library/preact";
import { vi } from "vitest";
import Tooltip, { ToolbarTooltip } from "../Tooltip";
import { visualBuilderStyles } from "../visualBuilder.style";

vi.mock("../visualBuilder.style", () => ({
    visualBuilderStyles: vi.fn(() => ({
        "tooltip-container": "tooltip-container-class",
        "tooltip-arrow": "tooltip-arrow-class",
        "toolbar-tooltip-content": "toolbar-tooltip-content-class",
        "toolbar-tooltip-content-item": "toolbar-tooltip-content-item-class",
        "visual-builder__field-icon": "field-icon-class",
    })),
}));

vi.mock("../icons", () => ({
    ContentTypeIcon: () => <div data-testid="content-type-icon">Icon</div>,
}));

vi.mock("../generators/generateCustomCursor", () => ({
    FieldTypeIconsMap: {
        reference: "<svg>Reference</svg>",
    },
}));

vi.mock("@floating-ui/dom", () => ({
    computePosition: vi.fn(() =>
        Promise.resolve({
            x: 100,
            y: 200,
            placement: "top-start",
            middlewareData: {},
        })
    ),
    flip: vi.fn(),
    shift: vi.fn(),
    offset: vi.fn(),
    arrow: vi.fn(),
}));

describe("Tooltip", () => {
    it("should show tooltip on mouseenter and hide on mouseleave", async () => {
        const { container, queryByRole } = render(
            <Tooltip content={<div>Tooltip content</div>}>
                <button>Hover me</button>
            </Tooltip>
        );

        const button = container.querySelector("button");

        expect(queryByRole("tooltip")).not.toBeInTheDocument();

        fireEvent.mouseEnter(button!);

        await waitFor(() => {
            expect(queryByRole("tooltip")).toBeInTheDocument();
            expect(queryByRole("tooltip")).toHaveTextContent(
                "Tooltip content"
            );
        });

        fireEvent.mouseLeave(button!);

        await waitFor(() => {
            expect(queryByRole("tooltip")).not.toBeInTheDocument();
        });
    });

    it("should show tooltip on focus and hide on blur", async () => {
        const { container, queryByRole } = render(
            <Tooltip content={<div>Tooltip content</div>}>
                <button>Focus me</button>
            </Tooltip>
        );

        const button = container.querySelector("button");

        fireEvent.focus(button!);

        await waitFor(() => {
            expect(queryByRole("tooltip")).toBeInTheDocument();
        });

        fireEvent.blur(button!);

        await waitFor(() => {
            expect(queryByRole("tooltip")).not.toBeInTheDocument();
        });
    });

    it("should use different placement prop", async () => {
        const { container, queryByRole } = render(
            <Tooltip
                content={<div>Tooltip content</div>}
                placement="bottom-start"
            >
                <button>Hover me</button>
            </Tooltip>
        );

        const button = container.querySelector("button");
        fireEvent.mouseEnter(button!);

        await waitFor(() => {
            expect(queryByRole("tooltip")).toBeInTheDocument();
        });
    });
});

describe("ToolbarTooltip", () => {
    it("should render children when disabled", () => {
        const { getByText } = render(
            <ToolbarTooltip
                data={{ contentTypeName: "Test", referenceFieldName: "Ref" }}
                disabled={true}
            >
                <button>Test Button</button>
            </ToolbarTooltip>
        );

        expect(getByText("Test Button")).toBeInTheDocument();
    });

    it("should render tooltip with content type and reference field", async () => {
        const { container, queryByText } = render(
            <ToolbarTooltip
                data={{
                    contentTypeName: "Blog Post",
                    referenceFieldName: "Author",
                }}
            >
                <button>Hover me</button>
            </ToolbarTooltip>
        );

        const button = container.querySelector("button");
        fireEvent.mouseEnter(button!);

        await waitFor(() => {
            expect(queryByText("Blog Post")).toBeInTheDocument();
            expect(queryByText("Author")).toBeInTheDocument();
        });
    });
});

