import React from "preact/compat";
import { render, fireEvent, screen } from "@testing-library/preact";
import { FieldLocationAppList } from "../FieldLocationAppList";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { vi } from "vitest";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));

vi.mock("../../visualBuilder.style", () => ({
    visualBuilderStyles: () => ({
        "visual-builder__field-location-app-list": "visual-builder__field-location-app-list",
        "visual-builder__field-location-app-list--left": "visual-builder__field-location-app-list--left",
        "visual-builder__field-location-app-list--right": "visual-builder__field-location-app-list--right",
        "visual-builder__field-location-app-list__search-container": "visual-builder__field-location-app-list__search-container",
        "visual-builder__field-location-app-list__search-input": "visual-builder__field-location-app-list__search-input",
        "visual-builder__field-location-app-list__search-icon": "visual-builder__field-location-app-list__search-icon",
        "visual-builder__field-location-app-list__content": "visual-builder__field-location-app-list__content",
        "visual-builder__field-location-app-list__no-results": "visual-builder__field-location-app-list__no-results",
        "visual-builder__field-location-app-list__no-results-text": "visual-builder__field-location-app-list__no-results-text",
        "visual-builder__field-location-app-list__item": "visual-builder__field-location-app-list__item",
        "visual-builder__field-location-app-list__item-icon-container": "visual-builder__field-location-app-list__item-icon-container",
        "visual-builder__field-location-app-list__item-icon": "visual-builder__field-location-app-list__item-icon",
        "visual-builder__field-location-app-list__item-title": "visual-builder__field-location-app-list__item-title",
    }),
}));

vi.mock("classnames", () => ({
    default: (...args: any[]) => args.filter(Boolean).join(" "),
}));

vi.mock("../icons/EmptyAppIcon", () => ({
    EmptyAppIcon: ({ id }: { id: string }) => <div data-testid={`empty-app-icon-${id}`}>Empty Icon</div>,
}));

const mockApps = [
    {
        uid: "1",
        title: "First App",
        app_installation_uid: "install_1",
        app_uid: "app_1",
        contentTypeUid: "content_1",
        entryUid: "entry_1",
        fieldDataType: "text",
        fieldDisplayName: "Title",
        fieldPath: "title",
        locale: "en-us",
        manifest: {
            uid: "manifest_1",
            name: "First App",
            description: "First app description",
            icon: "icon1.png",
            visibility: "public",
        },
    },
    {
        uid: "2",
        title: "Second App",
        app_installation_uid: "install_2",
        app_uid: "app_2",
        contentTypeUid: "content_2",
        entryUid: "entry_2",
        fieldDataType: "text",
        fieldDisplayName: "Description",
        fieldPath: "description",
        locale: "en-us",
        manifest: {
            uid: "manifest_2",
            name: "Second App",
            description: "Second app description",
            icon: "icon2.png",
            visibility: "public",
        },
    },
    {
        uid: "3",
        title: "Third App",
        app_installation_uid: "install_3",
        app_uid: "app_3",
        contentTypeUid: "content_3",
        entryUid: "entry_3",
        fieldDataType: "text",
        fieldDisplayName: "Content",
        fieldPath: "content",
        locale: "en-us",
        manifest: {
            uid: "manifest_3",
            name: "Third App",
            description: "Third app description",
            icon: "icon3.png",
            visibility: "public",
        },
    },
];

describe("FieldLocationAppList", () => {
    const mockToolbarRef = {
        current: {
            getBoundingClientRect: () => ({ top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50, x: 0, y: 0 }),
        } as HTMLDivElement,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render the app list with search input", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        expect(screen.getByPlaceholderText("Search for Apps")).toBeInTheDocument();
        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.getByText("Third App")).toBeInTheDocument();
    });

    it("should not render the first app (index 0)", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        expect(screen.queryByText("First App")).not.toBeInTheDocument();
        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.getByText("Third App")).toBeInTheDocument();
    });

    it("should filter apps when searching", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const searchInput = screen.getByPlaceholderText("Search for Apps");
        fireEvent.input(searchInput, { target: { value: "Second" } });

        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.queryByText("Third App")).not.toBeInTheDocument();
    });

    it("should show no results message when search has no matches", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const searchInput = screen.getByPlaceholderText("Search for Apps");
        fireEvent.input(searchInput, { target: { value: "NonExistent" } });

        expect(screen.getByText("No matching results found!")).toBeInTheDocument();
        expect(screen.queryByText("Second App")).not.toBeInTheDocument();
        expect(screen.queryByText("Third App")).not.toBeInTheDocument();
    });

    it("should send event when app is clicked", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const secondApp = screen.getByText("Second App");
        fireEvent.click(secondApp);

        expect(visualBuilderPostMessage?.send).toHaveBeenCalledWith("field-location-selected-app", {
            app: mockApps[1],
            position: { top: 0, left: 0, right: 100, bottom: 50, width: 100, height: 50, x: 0, y: 0 },
        });
    });

  



    it("should apply correct CSS classes for right position", () => {
        const { container } = render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const appList = container.firstChild as HTMLElement;
        expect(appList).toHaveClass("visual-builder__field-location-app-list");
    });

    it("should apply correct CSS classes for left position", () => {
        const { container } = render(<FieldLocationAppList apps={mockApps} position="left" toolbarRef={mockToolbarRef} />);

        const appList = container.firstChild as HTMLElement;
        expect(appList).toHaveClass("visual-builder__field-location-app-list");
    });

    it("should handle empty apps array", () => {
        render(<FieldLocationAppList apps={[]} position="right" toolbarRef={mockToolbarRef} />);

        expect(screen.getByText("No matching results found!")).toBeInTheDocument();
    });

    it("should handle single app (which gets filtered out)", () => {
        const singleApp = [mockApps[0]];
        render(<FieldLocationAppList apps={singleApp} position="right" toolbarRef={mockToolbarRef} />);

        expect(screen.getByText("No matching results found!")).toBeInTheDocument();
        expect(screen.queryByText("First App")).not.toBeInTheDocument();
    });

    it("should handle case-insensitive search", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const searchInput = screen.getByPlaceholderText("Search for Apps");
        fireEvent.input(searchInput, { target: { value: "second" } });

        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.queryByText("Third App")).not.toBeInTheDocument();
    });

    it("should clear search results when search input is cleared", () => {
        render(<FieldLocationAppList apps={mockApps} position="right" toolbarRef={mockToolbarRef} />);

        const searchInput = screen.getByPlaceholderText("Search for Apps");

        fireEvent.input(searchInput, { target: { value: "Second" } });
        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.queryByText("Third App")).not.toBeInTheDocument();

        fireEvent.input(searchInput, { target: { value: "" } });
        expect(screen.getByText("Second App")).toBeInTheDocument();
        expect(screen.getByText("Third App")).toBeInTheDocument();
    });

  
});
