import React from "preact/compat";
import { render, fireEvent } from "@testing-library/preact";
import { FieldLocationIcon } from "../FieldLocationIcon";
import visualBuilderPostMessage from "../../utils/visualBuilderPostMessage";
import { vi } from "vitest";



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

 
});