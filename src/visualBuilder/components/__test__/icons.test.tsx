import { cleanup, render } from "@testing-library/preact";
import {
    CaretIcon,
    DeleteIcon,
    MoveLeftIcon,
    MoveRightIcon,
    InfoIcon,
    EditIcon,
    PlusIcon,
} from "../icons";
import { asyncRender } from "../../../__test__/utils";

describe("IconComponents", () => {
    afterEach(() => {
        cleanup();
    })
    describe("CaretIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<CaretIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__caret-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("DeleteIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<DeleteIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "currentColor");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__delete-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("MoveLeftIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<MoveLeftIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "currentColor");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__move-left-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("MoveRightIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async() => {
            const { container } = await asyncRender(<MoveRightIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "currentColor");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__move-right-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("InfoIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<InfoIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "16");
            expect(svgElement).toHaveAttribute("height", "16");
            expect(svgElement).toHaveAttribute("fill", "none");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__info-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("EditIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<EditIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "24");
            expect(svgElement).toHaveAttribute("height", "24");
            expect(svgElement).toHaveAttribute("fill", "currentColor");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__edit-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });

    describe("PlusIcon", () => {
        test("renders with correct dimensions, fill, and stroke colors", async () => {
            const { container } = await asyncRender(<PlusIcon />);
            const svgElement = container.querySelector("svg");
            const strokeAttribute = svgElement?.getAttribute("stroke");
            expect(svgElement).toBeInTheDocument();
            expect(svgElement).toHaveAttribute("width", "20");
            expect(svgElement).toHaveAttribute("height", "20");
            expect(svgElement).toHaveAttribute(
                "data-testid",
                "visual-builder__plus-icon"
            );
            expect(strokeAttribute).toBeNull();
        });
    });
});
