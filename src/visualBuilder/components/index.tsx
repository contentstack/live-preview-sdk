import { render } from "preact";
import VisualBuilderComponent from "./VisualBuilder";
import { visualBuilderStyles } from "../visualBuilder.style";
import React from "preact/compat";
import { isOpenInBuilder, isOpenInPreviewShare } from "../../utils";
import { isPanelOpen } from "../panel/panelElement";

interface InitUIParams {
    resizeObserver: ResizeObserver;
}

function initUI(props: InitUIParams): void {
    const visualBuilderDOM = document.querySelector(
        `.visual-builder__container`
    );

    // The docked panel counts as "open in builder" too — the difference is only
    // which document is top-level. mountPanel() runs before VisualBuilder is
    // constructed, so the panel is already in the DOM by the time we ask.
    const isInBuilder = isOpenInBuilder() || isPanelOpen();
    const isInPreviewShare = isOpenInPreviewShare();

    if (!visualBuilderDOM && (isInBuilder || isInPreviewShare)) {
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
