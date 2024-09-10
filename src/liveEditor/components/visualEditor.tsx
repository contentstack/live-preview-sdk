import classNames from "classnames";
import { hideOverlay } from "../generators/generateOverlay";
import {
    liveEditorStyles,
    VisualBuilderGlobalStyles,
} from "../liveEditor.style";

interface VisualEditorProps {
    visualEditorContainer: HTMLDivElement | null;
    resizeObserver: ResizeObserver;
}

function VisualEditorComponent(props: VisualEditorProps): JSX.Element {
    return (
        <>
            {/* For some reason, goober's glob and createGlobalStyle were not working in this case. */}
            {/* glob also does not work when called in liveEditor's constructor */}
            <style
                dangerouslySetInnerHTML={{
                    __html: VisualBuilderGlobalStyles,
                }}
            />
            <div
                className={classNames(
                    liveEditorStyles()["visual-builder__cursor"],
                    "visual-builder__cursor"
                )}
                data-testid="visual-builder__cursor"
            ></div>
            <div
                className={classNames(
                    liveEditorStyles()["visual-builder__overlay__wrapper"],
                    "visual-builder__overlay__wrapper"
                )}
                data-testid="visual-builder__overlay__wrapper"
                onClick={(event) => {
                    const targetElement = event.currentTarget as HTMLDivElement;

                    const focusedToolbar = document.querySelector(
                        ".visual-builder__focused-toolbar"
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
                    className={classNames(
                        "visual-builder__overlay visual-builder__overlay--top",
                        liveEditorStyles()["visual-builder__overlay"]
                    )}
                    data-testid="visual-builder__overlay--top"
                ></div>
                <div
                    data-testid="visual-builder__overlay--left"
                    className={classNames(
                        "visual-builder__overlay visual-builder__overlay--left",
                        liveEditorStyles()["visual-builder__overlay"]
                    )}
                ></div>
                <div
                    data-testid="visual-builder__overlay--right"
                    className={classNames(
                        "visual-builder__overlay visual-builder__overlay--right",
                        liveEditorStyles()["visual-builder__overlay"]
                    )}
                ></div>
                <div
                    data-testid="visual-builder__overlay--bottom"
                    className={classNames(
                        "visual-builder__overlay visual-builder__overlay--bottom",
                        liveEditorStyles()["visual-builder__overlay"]
                    )}
                ></div>
                <div
                    data-testid="visual-builder__overlay--outline"
                    className={classNames(
                        "visual-builder__overlay--outline",
                        liveEditorStyles()["visual-builder__overlay--outline"]
                    )}
                ></div>
            </div>

            <div
                className={classNames(
                    "visual-builder__hover-outline visual-builder__hover-outline--unclickable",
                    liveEditorStyles()["visual-builder__hover-outline"],
                    liveEditorStyles()[
                        "visual-builder__hover-outline--unclickable"
                    ]
                )}
                data-testid="visual-builder__hover-outline"
            ></div>
            <div
                className={classNames(
                    "visual-builder__focused-toolbar",
                    liveEditorStyles()["visual-builder__focused-toolbar"]
                )}
                data-testid="visual-builder__focused-toolbar"
            ></div>
        </>
    );
}

export default VisualEditorComponent;
