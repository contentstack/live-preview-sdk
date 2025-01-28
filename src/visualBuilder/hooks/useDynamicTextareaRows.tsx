import React, { useEffect } from "preact/compat";

const useDynamicTextareaRows = (
    selector: string,
    dependency: string,
    defaultRows: number = 1,
    expandedRows: number = 3
) => {
    useEffect(() => {
        const textAreaElement: HTMLTextAreaElement | null =
            document.querySelector(selector);

        if (textAreaElement) {
            textAreaElement.setAttribute(
                "rows",
                dependency.length > 0 ? `${expandedRows}` : `${defaultRows}`
            );
        }

        return () => {
            textAreaElement?.setAttribute("rows", `${defaultRows}`);
        };
    }, [dependency, selector, defaultRows, expandedRows]);
};

export default useDynamicTextareaRows;
