import camelCase from "lodash.camelcase";

export default function getCamelCaseStyles(styles: { [key: string]: string }): {
    [key: string]: string;
} {
    return Object.keys(styles).reduce((acc, key) => {
        acc[camelCase(key)] = styles[key];
        return acc;
    }, {} as { [key: string]: string });
}
