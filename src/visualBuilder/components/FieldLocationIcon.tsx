import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";
import { MoreIcon } from "./icons";
import React, { useRef } from "preact/compat";
import { LoadingIcon } from "./icons/loading";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";

export const FieldLocationIcon = ({
    fieldLocationData,
    multipleFieldToolbarButtonClasses,
    handleMoreIconClick,
    moreButtonRef,
    isLoading,
    toolbarRef,
}: {
    fieldLocationData: any;
    multipleFieldToolbarButtonClasses: any;
    handleMoreIconClick: () => void;
    moreButtonRef: any;
    isLoading: boolean;
    toolbarRef: any;
}) => {
    // if (isLoading) {
    //     return (
    //         <div
    //             className={classNames(
    //                 visualBuilderStyles()[
    //                     "visual-builder__field-location-icons-container"
    //                 ]
    //             )}
    //         >
    //             <button className={multipleFieldToolbarButtonClasses}>
    //                 <LoadingIcon />
    //             </button>
    //         </div>
    //     );
    // }

    const currentAppRef = useRef<HTMLButtonElement>(null);

    if (!fieldLocationData?.apps || fieldLocationData.apps.length === 0) {
        return null;
    }

    return (
        <div
            ref={toolbarRef}
            className={classNames(
                visualBuilderStyles()[
                    "visual-builder__field-location-icons-container"
                ]
            )}
        >
            <hr
                className={visualBuilderStyles()["visual-builder__field-location-icons-container__divider"]}
            />
            <button
                key={`${fieldLocationData.apps[0].uid}`}
                title={fieldLocationData.apps[0].title}
                className={multipleFieldToolbarButtonClasses}
                data-tooltip={fieldLocationData.apps[0].title}
                ref={currentAppRef}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const positionData = currentAppRef.current?.getBoundingClientRect();
                    visualBuilderPostMessage?.send(VisualBuilderPostMessageEvents.FIELD_LOCATION_SELECTED_APP, {
                        app: fieldLocationData.apps[0],
                        position: positionData,
                    });
                }}
            >
                {fieldLocationData.apps[0].icon ? (
                    <img
                        src={fieldLocationData.apps[0].icon}
                        alt={fieldLocationData.apps[0].title}
                        className={visualBuilderStyles()["visual-builder__field-location-icons-container__app-icon"]}
                    />
                ) : (
                    <EmptyAppIcon
                        id={fieldLocationData.apps[0].app_installation_uid}
                    />
                )}
            </button>

            <button
                ref={moreButtonRef}
                className={multipleFieldToolbarButtonClasses}
                data-tooltip={"More"}
                onClick={handleMoreIconClick}
            >
                <MoreIcon />
            </button>
        </div>
    );
};
