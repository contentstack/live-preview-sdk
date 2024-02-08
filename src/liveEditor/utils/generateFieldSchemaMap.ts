import _ from "lodash";
import {
    ISchemaIndividualFieldMap,
    ITraverseSchemaVisitor,
} from "./types/index.types";
import {
    IContentTypeRootBlocks,
    IPageSchema,
} from "../../cms/types/contentTypeSchema.types";

export function generateFieldSchemaMap(
    pageCT: IPageSchema
): ISchemaIndividualFieldMap {
    const getFieldSchemaMap: ITraverseSchemaVisitor = {
        fieldMap: {},
        should_visit: (_fieldSchema, _path) => {
            return true;
        },
        visit: function (fieldSchema, path) {
            this.fieldMap[path] = fieldSchema;
            if (fieldSchema.data_type === "link") {
                //handle special key for special fields
                this.fieldMap[`${path}.title`] = fieldSchema;
                this.fieldMap[`${path}.href`] = fieldSchema;
            }
            if (fieldSchema.data_type === "file") {
                this.fieldMap[`${path}.url`] = fieldSchema;
            }
            if (fieldSchema.data_type === "blocks") {
                if (!fieldSchema.blocks) {
                    return;
                }
                fieldSchema.blocks.map((block) => {
                    this.fieldMap[`${path}.${block.uid}`] = {
                        ...block,
                        data_type: "block",
                        display_name: block.title,
                    };
                });
            }
        },
    };
    traverseSchema(pageCT.schema, [getFieldSchemaMap]);
    return getFieldSchemaMap.fieldMap;
}

function traverseSchema(
    schema: IContentTypeRootBlocks[],
    visitors: Array<ITraverseSchemaVisitor>
): void {
    function genPath(prefix: string, path: string) {
        return _.isEmpty(prefix) ? path : [prefix, path].join(".");
    }

    function traverse(fields: IContentTypeRootBlocks[], path: string) {
        path = path || "";
        for (const field of fields) {
            const currPath = genPath(path, field.uid);

            visitors.forEach((visitor) => {
                if (visitor.should_visit(field, currPath)) {
                    visitor.visit(field, currPath);
                }
            });

            if (field.data_type === "group") traverse(field.schema, currPath);
            else if (
                field.data_type === "global_field" &&
                _.isUndefined(field.schema) === false &&
                _.isEmpty(field.schema) === false
            )
                traverse(field.schema, currPath);
            if (field.data_type === "blocks") {
                field.blocks.forEach(function (block) {
                    if (block.schema)
                        traverse(block.schema, currPath + "." + block.uid);
                });
            }
            // if (field.data_type === "experience_container") {
            //     field.variations.forEach(function (variation: any) {
            //         if (variation.schema)
            //             traverse(
            //                 variation.schema,
            //                 currPath + "." + variation.uid
            //             );
            //     });
            // }
        }
    }
    traverse(schema, "");
}
