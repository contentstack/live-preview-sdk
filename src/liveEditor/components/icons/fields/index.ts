import { FieldDataType } from "../../../utils/types/index.types";
import { UrlIcon } from "../url";
import { CustomFieldIcon } from "./custom";
import { HtmlRteIcon } from "./html-rte";
import { ISODateIcon } from "./isodate";
import { JsonRteIcon } from "./json-rte";
import { MarkdownRteIcon } from "./markdown-rte";

// SVG components for use with Preact components
export const fieldIcons: Partial<Record<FieldDataType, React.FC>> = {
    link: UrlIcon,
    json_rte: JsonRteIcon,
    html_rte: HtmlRteIcon,
    markdown_rte: MarkdownRteIcon,
    custom_field: CustomFieldIcon,
    isodate: ISODateIcon,
};
