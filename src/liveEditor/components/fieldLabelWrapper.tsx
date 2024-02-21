// import { CslpData } from "../../cslp/types/cslp.types";
// import { CaretIcon } from "./icon";

// import { VisualEditorCslpEventDetails } from "../types/liveEditor.types";
// import { FieldSchemaMap } from "./../utils/fieldSchemaMap";

// interface CurrentFieldItemProps {
//     fieldMetadata: CslpData;
// }

// interface FieldLabelWrapperProps {
//     eventDetails: VisualEditorCslpEventDetails;
//     fieldMetadata: CslpData;
// }

// function CurrentFieldItemComponent(props: CurrentFieldItemProps) {
//     return (
//         <div className="visual-editor__focused-toolbar__field-label-wrapper__current-field visual-editor__button visual-editor__button--primary">
//             <div className="visual-editor__focused-toolbar__text">
//                 {props.fieldMetadata.fieldPath[props.fieldMetadata.fieldPath.length - 1]}
//             </div>
//             <div className="visual-editor__focused-toolbar__field-label-wrapper__caret">
//                 <CaretIcon />
//             </div>
//         </div>
//     )
// }

// function FieldLabelWrapperComponent(props: FieldLabelWrapperProps) {

//     FieldSchemaMap.getFieldSchema(
//         props.fieldMetadata.content_type_uid,
//         props.fieldMetadata.fieldPath
//     ).then((fieldSchema) => {
//         const { isDisabled: fieldDisabled, reason } = isFieldDisabled(
//             fieldSchema,
//             props.eventDetails
//         );
//         if (fieldDisabled) {
//             FieldLabelWrapper.classList.add(
//                 "visual-editor__focused-toolbar--field-disabled"
//             );
//         }
//         textDiv.innerText = fieldSchema.display_name;

//         if (fieldDisabled) {
//             caretIcon.innerHTML = info;
//             caretIcon.classList.add("visual-editor__tooltip");
//             caretIcon.setAttribute("data-tooltip", reason);
//         }
//         const outlineDOM = document.querySelector<HTMLDivElement>(
//             ".visual-editor__overlay--outline"
//         );
//         if (outlineDOM && fieldDisabled) {
//             outlineDOM.style.outlineColor = "#909090";
//         }
//     });

//     return (
//         <div className="visual-editor__focused-toolbar__field-label-wrapper">
//             <CurrentFieldItemComponent />
//         </div>
//     )
// }

// export default FieldLabelWrapperComponent;


// // const FieldLabelWrapper = document.createElement("div");
// // FieldLabelWrapper.classList.add(
// //     "visual-editor__focused-toolbar__field-label-wrapper"
// // );

// // const currentFieldItem = document.createElement("button");
// // currentFieldItem.classList.add(
// //     "visual-editor__focused-toolbar__field-label-wrapper__current-field",
// //     "visual-editor__button",
// //     "visual-editor__button--primary"
// // );

// // const textDiv = document.createElement("div");
// // textDiv.classList.add("visual-editor__focused-toolbar__text");
// // textDiv.innerText =
// //     fieldMetadata.fieldPath[fieldMetadata.fieldPath.length - 1];

// // const caretIcon = document.createElement("div");
// // caretIcon.classList.add(
// //     "visual-editor__focused-toolbar__field-label-wrapper__caret"
// // );
// // caretIcon.innerHTML = caretIcon;

// // currentFieldItem.append(textDiv, caretIcon);
