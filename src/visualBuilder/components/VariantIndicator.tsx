import React from "preact/compat";
import { VariantIcon } from "./icons/variant";
import { visualBuilderStyles } from "../visualBuilder.style";

export function VariantIndicator(): JSX.Element {
    return (
        <div className={visualBuilderStyles()["visual-builder__variant-indicator"]}>
            <VariantIcon size="18px" />
        </div>
    );

}