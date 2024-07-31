import { EditIcon } from "..";
import { FieldDataType } from "../../../utils/types/index.types";

// SVG components for use with Preact components
export const fieldIcons: Partial<Record<FieldDataType, React.FC>> = {
    link: EditIcon,
    json_rte: EditIcon,
    html_rte: EditIcon,
    markdown_rte: EditIcon,
    custom_field: EditIcon,
    isodate: EditIcon,
};
