import { useState } from "preact/hooks";

 // this.customCursor = generateVisualEditorCursor();
// this.overlayWrapper = generateVisualEditorOverlay(this.hideOverlay);
// this.focusedToolbar = generateFocusedToolbar();
// this.visualEditorWrapper = generateVisualEditorWrapper({
//     cursor: this.customCursor,
//     overlay: this.overlayWrapper,
//     toolbar: this.focusedToolbar,
        
interface VisualEditorComponentProps {
    onClickHandler: () => void;
}

function VisualEditorComponent(props: VisualEditorComponentProps) {

    // const [cursorVisible, setCursorVisible] = useState<boolean>(true);

    // const hideCursor = (): void => {
    //     // Update state to hide cursor
    //     if(cursorVisible) {
    //         setCursorVisible(false);
    //     }
    // };

    return (
        <>
            <h4>In SDK : Preact JSX : VisualEditorComponent</h4>

            <div 
                className={`visual-editor__cursor`}
                data-testid="visual-editor__cursor"
            >

            </div>
                
            <div 
                className="visual-editor__overlay__wrapper" data-testid="visual-editor__overlay__wrapper"
                onClick={(event) => {
                    const targetElement = event.target as Element;

                    if (targetElement.classList.contains("visual-editor__overlay")) {
                        props.onClickHandler();
                    }
                }}
            >

            </div>
            
            <div 
                className="visual-editor__overlay visual-editor__overlay--top"
                data-testid="visual-editor__overlay--top"
            >
                <div data-testid="visual-editor__overlay--left" className="visual-editor__overlay visual-editor__overlay--left"></div>
                <div data-testid="visual-editor__overlay--right" className="visual-editor__overlay visual-editor__overlay--right"></div>
                <div data-testid="visual-editor__overlay--bottom" className="visual-editor__overlay visual-editor__overlay--bottom"></div>
                <div data-testid="visual-editor__overlay--outline" className="visual-editor__overlay--outline"></div>
            </div>
            <div 
                className="visual-editor__focused-toolbar" 
                data-testid="visual-editor__focused-toolbar"
            >
            </div>
        
        </>
       
    )
}

export default VisualEditorComponent;
