import { hideFocusOverlay } from "../utils/focusOverlayWrapper";
import EventListenerHandlerParams from "../utils/listeners/params";

interface HideOverlayParams
    extends Pick<
        EventListenerHandlerParams,
        | "visualEditorWrapper"
        | "previousSelectedEditableDOM"
        | "focusedToolbar"
        | "resizeObserver"
    > {
    visualEditorOverlayWrapper: HTMLDivElement | null;
}

interface VisualEditorProps {
    visualEditorWrapper: HTMLDivElement | null;
    previousSelectedEditableDOM: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}

function hideOverlay(params: HideOverlayParams) {
    hideFocusOverlay({
        previousSelectedEditableDOM: params.previousSelectedEditableDOM,
        visualEditorWrapper: params.visualEditorWrapper,
        visualEditorOverlayWrapper: params.visualEditorOverlayWrapper,
        focusedToolbar: params.focusedToolbar,
    });

    if (!params.previousSelectedEditableDOM) return;
    params.resizeObserver.unobserve(params.previousSelectedEditableDOM);
    params.previousSelectedEditableDOM = null;
}

function VisualEditorComponent(props: VisualEditorProps) {
    return (
        <>
            <h4>In SDK : Preact JSX : VisualEditorComponent</h4>

            <div
                className={`visual-editor__cursor`}
                data-testid="visual-editor__cursor"
            ></div>

            <div
                className="visual-editor__overlay__wrapper"
                data-testid="visual-editor__overlay__wrapper"
                onClick={(event) => {
                    const targetElement = event.target as HTMLDivElement;

                    if (
                        targetElement.classList.contains(
                            "visual-editor__overlay"
                        )
                    ) {
                        const focusedToolbar = document.querySelector(
                            ".visual-editor__focused-toolbar"
                        ) as HTMLDivElement;
                        console.log("[IN SDK] : ONCLICK : ", focusedToolbar);

                        hideOverlay({
                            visualEditorWrapper: props.visualEditorWrapper,
                            visualEditorOverlayWrapper: targetElement,
                            previousSelectedEditableDOM:
                                props.previousSelectedEditableDOM,
                            focusedToolbar: focusedToolbar,
                            resizeObserver: props.resizeObserver,
                        });
                    }
                }}
            ></div>

            <div
                className="visual-editor__overlay visual-editor__overlay--top"
                data-testid="visual-editor__overlay--top"
            >
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
                className="visual-editor__focused-toolbar"
                data-testid="visual-editor__focused-toolbar"
            ></div>
        </>
    );
}

export default VisualEditorComponent;
