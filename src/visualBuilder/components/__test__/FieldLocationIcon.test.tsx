import React from "preact/compat";
import { render, fireEvent } from "@testing-library/preact";
import { FieldLocationIcon } from "../FieldLocationIcon";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { vi } from "vitest";
import { asyncRender } from "../../../__test__/utils";

vi.mock("../../utils/visualBuilderPostMessage", () => ({
    default: {
        send: vi.fn(),
    },
}));



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

    it("should handle app click and send post message", () => {
        const mockToolbarRef = { current: null as HTMLElement | null };
        const mockFieldLocationData = {
            apps: [
                {
                    uid: "app1",
                    title: "Test App",
                    icon: "icon1.png",
                    app_installation_uid: "install1",
                },
            ],
        };
        const mockDomEditStack = [{ uid: "edit1" }];

        const { getByTestId } = render(
            <FieldLocationIcon
                fieldLocationData={mockFieldLocationData}
                multipleFieldToolbarButtonClasses="test-class"
                handleMoreIconClick={() => {}}
                moreButtonRef={{ current: null }}
                toolbarRef={mockToolbarRef}
                domEditStack={mockDomEditStack}
            />
        );

        const appIcon = getByTestId("field-location-icon");
        fireEvent.click(appIcon);

        // Verify send was called with correct event and app data
        expect(visualBuilderPostMessage?.send).toHaveBeenCalled();
        const callArgs = (visualBuilderPostMessage?.send as any).mock.calls[0];
        expect(callArgs[0]).toBe(
            VisualBuilderPostMessageEvents.FIELD_LOCATION_SELECTED_APP
        );
        expect(callArgs[1].app).toEqual(mockFieldLocationData.apps[0]);
        expect(callArgs[1].DomEditStack).toEqual(mockDomEditStack);
        expect(callArgs[1].position).toBeDefined();
    });

    it("should not send post message when toolbarRef is null", () => {
        const mockFieldLocationData = {
            apps: [
                {
                    uid: "app1",
                    title: "Test App",
                    icon: "icon1.png",
                    app_installation_uid: "install1",
                },
            ],
        };

        const toolbarRef = { current: null };

        const { getByTestId } = render(
            <FieldLocationIcon
                fieldLocationData={mockFieldLocationData}
                multipleFieldToolbarButtonClasses="test-class"
                handleMoreIconClick={() => {}}
                moreButtonRef={{ current: null }}
                toolbarRef={toolbarRef}
                domEditStack={[]}
            />
        );

        // Ensure toolbarRef stays null (the component sets it to the div ref)
        // But the handleAppClick checks toolbarRef.current before sending
        const appIcon = getByTestId("field-location-icon");
        
        // Manually set toolbarRef.current to null to simulate the condition
        toolbarRef.current = null;
        
        fireEvent.click(appIcon);

        // The function checks if(!toolbarRef.current) return, so it should not be called
        // However, the component sets toolbarRef to the container div, so we need to test differently
        // Let's verify the click handler runs but the send is not called due to the null check
        expect(visualBuilderPostMessage?.send).not.toHaveBeenCalled();
    });
});