export interface ITraverseSchemaVisitor extends Record<string, any> {
    should_visit: (fieldSchema: any, path: string) => boolean;
    visit: (fieldSchema: any, path: string) => void;
}
