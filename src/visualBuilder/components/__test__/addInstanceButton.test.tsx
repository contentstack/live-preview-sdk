import {
    render,
    cleanup,
    fireEvent,
    getByTestId,
} from "@testing-library/preact";
import AddInstanceButtonComponent from "../addInstanceButton";
import { ISchemaFieldMap } from "../../utils/types/index.types";

const schema = {
    data_type: "text",
    display_name: "Single Line Textbox",
    uid: "single_line",
    field_metadata: {
        description: "",
        default_value: "",
        version: 3,
    },
    format: "",
    error_messages: {
        format: "",
    },
    mandatory: false,
    multiple: true,
    non_localizable: false,
    unique: false,
};

describe("AddInstanceButtonComponent", () => {
    afterEach(cleanup);

    test("renders button with proper class and icon", () => {
        const onClickCallback = vi.fn();
        render(
            <AddInstanceButtonComponent
                value={[]}
                fieldSchema={schema as ISchemaFieldMap}
                onClick={onClickCallback}
            />
        );
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        expect(buttonElement).toBeInTheDocument();
        expect(buttonElement).toHaveClass("visual-builder__add-button");

        expect(buttonElement.querySelector("svg")).toBeTruthy();
        expect(buttonElement.querySelector("path")).toBeTruthy();
    });

    test("calls onClickCallback when button is clicked", () => {
        const onClickCallback = vi.fn();
        render(
            <AddInstanceButtonComponent
                value={[]}
                fieldSchema={schema as ISchemaFieldMap}
                onClick={onClickCallback}
            />
        );
        const buttonElement = getByTestId(
            document.body,
            "visual-builder-add-instance-button"
        );
        fireEvent.click(buttonElement);
        expect(onClickCallback).toHaveBeenCalled();
    });
});
