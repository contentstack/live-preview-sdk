import { render } from "preact";
import VisualEditorComponent from "./visualEditor";

interface InitUIParams {
    resizeObserver: ResizeObserver;
}

function initUI(props: InitUIParams): void {
    const visualEditorDOM = document.querySelector(".visual-editor__container");
    if (!visualEditorDOM) {
        const visualEditorContainer = document.createElement("div");
        visualEditorContainer.classList.add("visual-editor__container");
        visualEditorContainer.setAttribute(
            "data-testid",
            "visual-editor__container"
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
