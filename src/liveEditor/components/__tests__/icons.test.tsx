import "@testing-library/jest-dom/extend-expect";
import { render } from "@testing-library/preact";
import {
    CaretIcon,
    DeleteIcon,
    MoveLeftIcon,
    MoveRightIcon,
    InfoIcon,
    EditIcon,
    PlusIcon,
} from "../icons";

describe("IconComponents", () => {
    describe("CaretIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<CaretIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__caret-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("DeleteIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<DeleteIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__delete-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("MoveLeftIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<MoveLeftIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__move-left-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("MoveRightIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<MoveRightIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__move-right-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("InfoIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<InfoIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__info-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("EditIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<EditIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "24");
            expect(svgElement).toHaveAttribute("height", "24");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__edit-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("PlusIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", () => {
            const { container } = render(<PlusIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "20");
            expect(svgElement).toHaveAttribute("height", "20");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-editor__plus-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });
});
