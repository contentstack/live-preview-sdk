import { render } from "preact";
import VisualBuilderComponent from "./VisualBuilder";
import { visualBuilderStyles } from "../visualBuilder.style";
import React from "preact/compat";
import { isOpenInBuilder } from "../../utils";

interface InitUIParams {
    resizeObserver: ResizeObserver;
}

function initUI(props: InitUIParams): void {
    const visualBuilderDOM = document.querySelector(
        `.visual-builder__container`
    );

    const isInBuilder = isOpenInBuilder();

    if (!visualBuilderDOM && isInBuilder) {
        const visualBuilderContainer = document.createElement("div");
        visualBuilderContainer.classList.add(
            visualBuilderStyles()["visual-builder__container"],
            "visual-builder__container"
        );
        visualBuilderContainer.setAttribute(
            "data-testid",
            "visual-builder__container"
        );

        document.body.appendChild(visualBuilderContainer);

        render(
            <VisualBuilderComponent
                visualBuilderContainer={visualBuilderContainer}
                resizeObserver={props.resizeObserver}
            />,
            visualBuilderContainer
        );
    }

    return;
}

export default initUI;
