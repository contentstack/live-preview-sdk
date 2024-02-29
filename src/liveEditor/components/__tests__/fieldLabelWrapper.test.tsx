import { render } from "@testing-library/preact";
import FieldLabelWrapperComponent from "../fieldLabelWrapper";
import { CslpData } from "../../../cslp/types/cslp.types";
import { VisualEditorCslpEventDetails } from "../../types/liveEditor.types";

jest.mock("../../utils/fieldSchemaMap", () => ({
  FieldSchemaMap: {
    getFieldSchema: jest.fn().mockResolvedValue({ display_name: 'Field 1' }),
  },
}));

jest.mock("../../utils/isFieldDisabled", () => ({
  isFieldDisabled: jest.fn().mockReturnValue({ isDisabled: false }),
}));

const mockFieldMetadata: CslpData = {
    entry_uid: "",
    content_type_uid: "",
    cslpValue: "",
    locale: "",
    fieldPath: "",
    fieldPathWithIndex: "",
    multipleFieldMetadata: {
        index: 0,
        parentDetails: {
            parentPath: "",
            parentCslpValue: "",
        },
    },
};

const mockEditableElement: VisualEditorCslpEventDetails = {
    editableElement: document.createElement('div'),
    cslpData: "",
    fieldMetadata: mockFieldMetadata
}


// TODO

// describe('FieldLabelWrapperComponent', () => {
//   it('renders FieldLabelWrapperComponent correctly', async () => {
//     const parentPaths = ['path1', 'path2'];

//     const { getByText, getByTestId } = render(
//       <FieldLabelWrapperComponent
//         fieldMetadata={mockFieldMetadata}
//         eventDetails={mockEditableElement}
//         parentPaths={parentPaths}
//       />
//     );

//     expect(getByText('Field 1')).toBeInTheDocument();
//     expect(getByTestId('caret-icon')).toBeInTheDocument();

//     expect(getByText('Display Name 1')).toBeInTheDocument();
//     expect(getByText('Display Name 2')).toBeInTheDocument(); 
//   });

// });
