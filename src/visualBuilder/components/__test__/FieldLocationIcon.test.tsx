import React from "preact/compat";
import { render, fireEvent } from "@testing-library/preact";
import { FieldLocationIcon } from "../FieldLocationIcon";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { vi } from "vitest";
import { asyncRender } from "../../../__test__/utils";



describe("FieldLocationIcon", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render fieldlocation icon when we have data in fieldLocationData", () => {
        const { getByTestId } = render(
            <FieldLocationIcon 
                fieldLocationData={{ apps: [{ uid: "1", title: "Test App", app_installation_uid: "test" }] }} 
                multipleFieldToolbarButtonClasses="test-class" 
                handleMoreIconClick={() => {}} 
                moreButtonRef={null} 
                toolbarRef={null} 
                
            />
        );
        expect(getByTestId("field-location-icon")).toBeInTheDocument();
    });

    it("should not render fieldlocation icon when we don't have data in fieldLocationData", () => {
        const { queryByTestId } = render(
            <FieldLocationIcon 
                fieldLocationData={{ apps: [] }} 
                multipleFieldToolbarButtonClasses="test-class" 
                handleMoreIconClick={() => {}} 
                moreButtonRef={null} 
                toolbarRef={null} 
            />
        );
        expect(queryByTestId("field-location-icon")).not.toBeInTheDocument();
    });

    describe("Field Location Dropdown", () => {
     
       

        test("FieldLocationIcon shows dropdown icon when multiple apps are available", async () => {
            const mockFieldLocationData = {
                apps: [
                    {
                        uid: "app1",
                        title: "First App",
                        icon: "icon1.png",
                        app_installation_uid: "install1"
                    },
                    {
                        uid: "app2", 
                        title: "Second App",
                        icon: "icon2.png",
                        app_installation_uid: "install2"
                    }
                ]
            };

            const mockHandleMoreIconClick = vi.fn();
            const mockButtonRef = { current: null };
            const mockToolbarRef = { current: null };

            const { container } = await asyncRender(
                <FieldLocationIcon
                    fieldLocationData={mockFieldLocationData}
                    multipleFieldToolbarButtonClasses="mock-button-class"
                    handleMoreIconClick={mockHandleMoreIconClick}
                    moreButtonRef={mockButtonRef}
                    toolbarRef={mockToolbarRef}
                />
            );

            const appIcon = container.querySelector('[data-testid="field-location-icon"]');
            expect(appIcon).toBeInTheDocument();

            const moreButton = container.querySelector('[data-testid="field-location-more-button"]');
            expect(moreButton).toBeInTheDocument();

            fireEvent.click(moreButton!);
            expect(mockHandleMoreIconClick).toHaveBeenCalledTimes(1);
        });

        test("FieldLocationIcon does not show dropdown icon when only one app is available", async () => {
            const mockFieldLocationData = {
                apps: [
                    {
                        uid: "app1",
                        title: "First App",
                        icon: "icon1.png",
                        app_installation_uid: "install1"
                    }
                ]
            };

            const mockHandleMoreIconClick = vi.fn();
            const mockButtonRef = { current: null };
            const mockToolbarRef = { current: null };

            const { container } = await asyncRender(
                <FieldLocationIcon
                    fieldLocationData={mockFieldLocationData}
                    multipleFieldToolbarButtonClasses="mock-button-class"
                    handleMoreIconClick={mockHandleMoreIconClick}
                    moreButtonRef={mockButtonRef}
                    toolbarRef={mockToolbarRef}
                />
            );

            const appIcon = container.querySelector('[data-testid="field-location-icon"]');
            expect(appIcon).toBeInTheDocument();

            const moreButton = container.querySelector('[data-testid="field-location-more-button"]');
            expect(moreButton).not.toBeInTheDocument();
        });

    });
 
});