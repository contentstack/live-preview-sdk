import { render, cleanup, waitFor } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";

vi.mock("../../utils/fieldSchemaMap", () => {
    let ind = 0;
    return {
        FieldSchemaMap: {
            getFieldSchema: vi
                .fn()
                .mockImplementation((content_type_uid, fieldPath) => {
                    ind++;
                    return { display_name: `Field ${ind}` };
                }),
        },
    };
});

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi
        .fn()
        .mockReturnValueOnce({ isDisabled: false })
        .mockReturnValueOnce({ isDisabled: false })
        .mockReturnValueOnce({
            isDisabled: true,
            reason: "You have only read access to this field",
        }),
}));

vi.mock("../../../cslp", () => ({
    extractDetailsFromCslp: vi.fn().mockImplementation((path) => {
        return { content_type_uid: "mockContentTypeUid", fieldPath: path };
    }),
}));

describe("FieldLabelWrapperComponent", () => {
    afterEach(cleanup);

    const mockFieldMetadata: CslpData = {
        entry_uid: "",
        content_type_uid: "mockContentTypeUid",
        cslpValue: "",
        locale: "",
        variant: undefined,
        fieldPath: "mockFieldPath",
        fieldPathWithIndex: "",
        multipleFieldMetadata: {
            index: 0,
            parentDetails: {
                parentPath: "",
                parentCslpValue: "",
            },
        },
        instance: {
            fieldPathWithIndex: "",
        },
    };

    const mockEventDetails: VisualBuilderCslpEventDetails = {
        editableElement: document.createElement("div"),
        cslpData: "",
        fieldMetadata: mockFieldMetadata,
    };

    const mockGetParentEditable = () => document.createElement("div");

    test("renders current field and parent fields correctly", async () => {
        const parentPaths = ["parentPath1", "parentPath2", "parentPath3"];

        const { getByText } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={parentPaths}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // Wait for the async updates (because of useEffect) to displayNames
        await waitFor(() => {
            parentPaths.forEach((path, index) => {
                expect(getByText(`Field ${index + 1}`)).toBeInTheDocument();
            });
        });
    });

    test("displays current field icon properly", async () => {
        const { getByTestId } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        expect(getByTestId("visual-builder__caret-icon")).toBeInTheDocument();
    });

    test("renders with correct class when field is disabled", async () => {
        const { container } = render(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );
        await waitFor(() => {
            expect(container.firstChild).toHaveClass(
                "visual-builder__focused-toolbar--field-disabled"
            );
        });
    });
});