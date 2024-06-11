import { VisualEditor } from "..";
import { hideOverlay } from "../generators/generateOverlay";

interface VisualEditorProps {
    visualEditorContainer: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}

function VisualEditorComponent(props: VisualEditorProps): JSX.Element {
    return (
        <>
            <div
                className="visual-editor__cursor"
                data-testid="visual-editor__cursor"
            ></div>
            <div
                className="visual-editor__overlay__wrapper"
                data-testid="visual-editor__overlay__wrapper"
                onClick={(event) => {
                    const targetElement = event.currentTarget as HTMLDivElement;

                    const focusedToolbar = document.querySelector(
                        ".visual-editor__focused-toolbar"
                    ) as HTMLDivElement;

                    VisualEditor.VisualEditorUnfocusFieldCleanups.forEach((cleanup) => {
                        cleanup();
                    });

                    hideOverlay({
                        visualEditorContainer: props.visualEditorContainer,
                        visualEditorOverlayWrapper: targetElement,
                        focusedToolbar: focusedToolbar,
                        resizeObserver: props.resizeObserver,
                    });
                }}
            >
                <div
                    className="visual-editor__overlay visual-editor__overlay--top"
                    data-testid="visual-editor__overlay--top"
                ></div>
                <div
                    data-testid="visual-editor__overlay--left"
                    className="visual-editor__overlay visual-editor__overlay--left"
                ></div>
                <div
                    data-testid="visual-editor__overlay--right"
                    className="visual-editor__overlay visual-editor__overlay--right"
                ></div>
                <div
                    data-testid="visual-editor__overlay--bottom"
                    className="visual-editor__overlay visual-editor__overlay--bottom"
                ></div>
                <div
                    data-testid="visual-editor__overlay--outline"
                    className="visual-editor__overlay--outline"
                ></div>
            </div>

            <div
                className="visual-editor__hover-outline"
                data-testid="visual-editor__hover-outline">
            </div>
            <div
                className="visual-editor__focused-toolbar"
                data-testid="visual-editor__focused-toolbar"
            ></div>
        </>
    );
}

export default VisualEditorComponent;
