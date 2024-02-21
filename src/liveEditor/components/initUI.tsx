import { h, render } from "preact";
import VisualEditorComponent from "./visualEditor";

function initUI() : void {

    console.log('[IN SDK] : initUI : creating root node');

    const visualEditorDOM = document.querySelector(
        ".visual-editor__container"
    );
    if (!visualEditorDOM) {
       
        const visualEditorWrapper = document.createElement("div");
        visualEditorWrapper.classList.add("visual-editor__container");
        visualEditorWrapper.setAttribute("data-testid", "visual-editor__container");

        document.body.appendChild(visualEditorWrapper);
        
        const dummy = () => {
            console.log('[IN SDK] : clicked visualEditorComponent');   
        }

        render(<VisualEditorComponent onClickHandler={dummy} />, visualEditorWrapper);
        
        console.log('[IN SDK] : initUI : rendered root node');
    }
    
    return;

}

export default initUI;
