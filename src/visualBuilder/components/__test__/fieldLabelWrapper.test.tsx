import { waitFor } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualBuilderCslpEventDetails } from "../../types/visualBuilder.types";
import { VisualBuilderPostMessageEvents } from "../../utils/types/postMessage.types";
import { singleLineFieldSchema } from "../../../__test__/data/fields";
import { asyncRender } from "../../../__test__/utils";
import { isFieldDisabled } from "../../utils/isFieldDisabled";
import { FieldSchemaMap } from "../../utils/fieldSchemaMap";
import { getEntryPermissionsCached } from "../../utils/getEntryPermissionsCached";
import React from "preact/compat";

const DISPLAY_NAMES = {
    mockFieldCslp: "Field 0",
    parentPath1: "Field 1",
    parentPath2: "Field 2",
    parentPath3: "Field 3",
};

const pathPrefix = "contentTypeUid.entryUid.locale";
const PARENT_PATHS = [
    `${pathPrefix}.parentPath1`,
    `${pathPrefix}.parentPath2`,
    `${pathPrefix}.parentPath3`,
];

vi.mock("../../utils/fieldSchemaMap", () => {
    return {
        FieldSchemaMap: {
            getFieldSchema: vi
                .fn()
                .mockImplementation((content_type_uid, fieldPath) => {
                    return singleLineFieldSchema;
                }),
        },
    };
});

vi.mock("../../utils/visualBuilderPostMessage", async () => {
    return {
        default: {
            send: vi
                .fn()
                .mockImplementation((eventName: string, fields: CslpData[]) => {
                    if (
                        eventName ===
                        VisualBuilderPostMessageEvents.GET_FIELD_DISPLAY_NAMES
                    ) {
                        // TODO there is some issue with mocking extractCslpDetails or
                        // the way it works with the mock cslp values, needs more investigation
                        // const names: Record<string, string> = {};
                        // fields.forEach((field) => {
                        //     names[field.cslpValue] =
                        //         /** @ts-expect-error - display name will be there */
                        //         DISPLAY_NAMES[field.cslpValue];
                        // });
                        // NOTE UGLY hack for now
                        if (fields.length === 1) {
                            return Promise.resolve({
                                [fields[0].cslpValue]:
                                    DISPLAY_NAMES.mockFieldCslp,
                            });
                        }
                        const names = {
                            mockFieldCslp: "Field 0",
                            [PARENT_PATHS[0]]: DISPLAY_NAMES.parentPath1,
                            [PARENT_PATHS[1]]: DISPLAY_NAMES.parentPath2,
                            [PARENT_PATHS[2]]: DISPLAY_NAMES.parentPath3,
                        };
                        return Promise.resolve(names);
                    }
                    return Promise.resolve({});
                }),
            on: vi.fn(),
        },
    };
});

vi.mock("../../utils/isFieldDisabled", () => ({
    isFieldDisabled: vi.fn().mockReturnValue({ isDisabled: false }),
}));

vi.mock("../../../cslp", () => ({
    extractDetailsFromCslp: vi.fn().mockImplementation((path) => {
        return { content_type_uid: "mockContentTypeUid", fieldPath: path };
    }),
}));

describe("FieldLabelWrapperComponent", () => {
    beforeEach(() => {
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: false,
            // @ts-expect-error - reason is an unexported literal
            reason: "",
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    const mockFieldMetadata: CslpData = {
        entry_uid: "",
        content_type_uid: "mockContentTypeUid",
        cslpValue: "mockFieldCslp",
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
        const { findByText } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={PARENT_PATHS}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const currentField = await findByText(DISPLAY_NAMES.mockFieldCslp);
        expect(currentField).toBeVisible();

        const parentPath1 = await findByText(DISPLAY_NAMES.parentPath1);
        expect(parentPath1).toBeInTheDocument();
        const parentPath2 = await findByText(DISPLAY_NAMES.parentPath2);
        expect(parentPath2).toBeInTheDocument();
        const parentPath3 = await findByText(DISPLAY_NAMES.parentPath3);
        expect(parentPath3).toBeInTheDocument();
    });

    test("displays current field icon", async () => {
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const caretIcon = await findByTestId("visual-builder__field-icon");
        expect(caretIcon).toBeInTheDocument();
    });

    test("renders with correct class when field is disabled", async () => {
        vi.mocked(isFieldDisabled).mockReturnValue({
            isDisabled: true,
            // @ts-expect-error - reason is an unexported literal
            reason: "You have only read access to this field",
        });
        const { findByTestId } = await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        const fieldLabel = await findByTestId(
            "visual-builder__focused-toolbar__field-label-wrapper"
        );

        await waitFor(() => {
            expect(fieldLabel).toHaveClass(
                "visual-builder__focused-toolbar--field-disabled"
            );
        });
    });

    test("calls isFieldDisabled with correct arguments", async () => {
        const mockFieldSchema = { ...singleLineFieldSchema };
        const mockEntryPermissions = {
            create: true,
            read: true,
            update: false,
            delete: true,
            publish: true,
        };

        vi.mocked(FieldSchemaMap.getFieldSchema).mockResolvedValue(
            mockFieldSchema
        );
        vi.mocked(getEntryPermissionsCached).mockResolvedValue(
            mockEntryPermissions
        );

        await asyncRender(
            <FieldLabelWrapperComponent
                fieldMetadata={mockFieldMetadata}
                eventDetails={mockEventDetails}
                parentPaths={[]}
                getParentEditableElement={mockGetParentEditable}
            />
        );

        // wait for component to mount
        await waitFor(() => {
            expect(
                document.querySelector(
                    ".visual-builder__focused-toolbar__field-label-container"
                )
            ).toBeInTheDocument();
        });

        expect(isFieldDisabled).toHaveBeenCalledWith(
            mockFieldSchema,
            mockEventDetails,
            mockEntryPermissions
        );
    });
});
