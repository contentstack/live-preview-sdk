import { h, render } from "preact";
import VisualEditorComponent from "./visualEditor";

interface InitUIParams {
    resizeObserver: ResizeObserver;
}

function initUI(props: InitUIParams) : void {

    console.log('[IN SDK] : initUI : creating root node');

    const visualEditorDOM = document.querySelector(
        ".visual-editor__container"
    );
    if (!visualEditorDOM) {
        
        const visualEditorWrapper = document.createElement("div");
        visualEditorWrapper.classList.add("visual-editor__container");
        visualEditorWrapper.setAttribute("data-testid", "visual-editor__container");

        document.body.appendChild(visualEditorWrapper);
        
        render(<VisualEditorComponent 
            visualEditorWrapper={visualEditorWrapper}
            resizeObserver={props.resizeObserver}
        />, visualEditorWrapper);
    }
    
    return;

}

export default initUI;
