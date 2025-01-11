import React, { useEffect } from "preact/compat";

const useDynamicTextareaRows = (
    ref: React.RefObject<HTMLTextAreaElement>,
    dependency: string,
    defaultRows: number = 1,
    expandedRows: number = 3
) => {
    useEffect(() => {
        const textAreaElement = ref.current;

        if (textAreaElement) {
            textAreaElement.setAttribute(
                "rows",
                dependency.length > 0 ? `${expandedRows}` : `${defaultRows}`
            );
        }

        return () => {
            if (textAreaElement) {
                textAreaElement.setAttribute("rows", `${defaultRows}`);
            }
        };
    }, [dependency, ref, defaultRows, expandedRows]);
};

export default useDynamicTextareaRows;
