import { render } from "preact";
import VisualEditorComponent from "./VisualBuilder";
import { visualBuilderStyles } from "../visualBuilder.style";
import React from "preact/compat";

interface InitUIParams {
    resizeObserver: ResizeObserver;
}

function initUI(props: InitUIParams): void {
    const visualEditorDOM = document.querySelector(
        `.visual-builder__container`
    );
    if (!visualEditorDOM) {
        const visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add(
            visualBuilderStyles()["visual-builder__container"],
            "visual-builder__container"
        );
        visualEditorContainer.setAttribute(
            "data-testid",
            "visual-builder__container"
        );

        document.body.appendChild(visualEditorContainer);

        render(
            <VisualEditorComponent
                visualEditorContainer={visualEditorContainer}
                resizeObserver={props.resizeObserver}
            />,
            visualEditorContainer
        );
    }

    return;
}

export default initUI;
