import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { WarningOctagonIcon } from "./icons";
import { useEffect, useRef, useState } from "preact/compat";

interface CslpErrorProps {}

export function CslpError({}: CslpErrorProps) {
    const errorRef = useRef<HTMLDivElement>(null);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const errorElement = errorRef.current;

        const showTooltip = () => {
            setShowTooltip(true);
        };

        const hideTooltip = () => {
            setShowTooltip(false);
        };

        if (errorElement) {
            errorElement.addEventListener("mouseenter", showTooltip);
            errorElement.addEventListener("mouseleave", hideTooltip);
        }

        return () => {
            if (errorElement) {
                errorElement.removeEventListener("mouseenter", showTooltip);
                errorElement.removeEventListener("mouseleave", hideTooltip);
            }
        };
    }, []);

    return (
        <div
            className={classNames(
                visualBuilderStyles()["visual-builder__focused-toolbar__error"]
            )}
            ref={errorRef}
        >
            <WarningOctagonIcon />
            <span
                className={classNames(
                    visualBuilderStyles()[
                        "visual-builder__focused-toolbar__error-text"
                    ]
                )}
            >
                Error
            </span>
            {showTooltip ? (
                <div
                    className={classNames(
                        visualBuilderStyles()[
                            "visual-builder__focused-toolbar__error-toolip"
                        ]
                    )}
                >
                    <p>Invalid CSLP tag</p>
                    <span>
                        Due to the invalid CSLP tag, the related Contentstack
                        field cannot be identified, and therefore, the content
                        cannot be modified.
                    </span>
                </div>
            ) : null}
        </div>
    );
}
