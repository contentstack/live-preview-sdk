import { hideFocusOverlay } from "../generators/generateOverlay";
import EventListenerHandlerParams from "../listeners/params";
import VisualEditorGlobalState from "../globals";

interface HideOverlayParams
    extends Pick<
        EventListenerHandlerParams,
        "visualEditorContainer" | "focusedToolbar" | "resizeObserver"
    > {
    visualEditorOverlayWrapper: HTMLDivElement | null;
}

interface VisualEditorProps {
    visualEditorContainer: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}

function hideOverlay(params: HideOverlayParams) {
    hideFocusOverlay({
        visualEditorContainer: params.visualEditorContainer,
        visualEditorOverlayWrapper: params.visualEditorOverlayWrapper,
        focusedToolbar: params.focusedToolbar,
    });

    if (!VisualEditorGlobalState.value.previousSelectedEditableDOM) return;
    params.resizeObserver.unobserve(
        VisualEditorGlobalState.value.previousSelectedEditableDOM
    );
    VisualEditorGlobalState.value.previousSelectedEditableDOM = null;
}

function VisualEditorComponent(props: VisualEditorProps) {
    return (
        <>
            <div
                className={`visual-editor__cursor`}
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
                className="visual-editor__focused-toolbar"
                data-testid="visual-editor__focused-toolbar"
            ></div>
        </>
    );
}

export default VisualEditorComponent;
