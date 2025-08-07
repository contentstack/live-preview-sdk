import classNames from "classnames";
import { visualBuilderStyles } from "../visualBuilder.style";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";
import { MoreIcon } from "./icons";
import React, { useRef } from "preact/compat";
import { LoadingIcon } from "./icons/loading";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { CslpData } from "../../utils/cslpdata";

export const FieldLocationIcon = ({
    fieldLocationData,
    multipleFieldToolbarButtonClasses,
    handleMoreIconClick,
    moreButtonRef,
    toolbarRef,
    domEditStack
}: {
    fieldLocationData: any;
    multipleFieldToolbarButtonClasses: any;
    handleMoreIconClick: () => void;
    moreButtonRef: any;
    toolbarRef: any;
    domEditStack:CslpData[]
}) => {



    if (!fieldLocationData?.apps || fieldLocationData?.apps?.length === 0) {
        return null;
    }

    const handleAppClick = (app: any) => {
        if(!toolbarRef.current) return
        visualBuilderPostMessage?.send(VisualBuilderPostMessageEvents.FIELD_LOCATION_SELECTED_APP, {
            app,
            position: toolbarRef.current?.getBoundingClientRect(),
            DomEditStack:domEditStack
        });
    };

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
                onClick={(e) => {
                   e.preventDefault();
                   e.stopPropagation();
                   handleAppClick(fieldLocationData.apps[0]);
                }}
                data-testid="field-location-icon"
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

           
           {
            fieldLocationData.apps.length > 1 && (
                <button
                    ref={moreButtonRef}
                    className={multipleFieldToolbarButtonClasses}
                    data-tooltip={"More"}
                    onClick={handleMoreIconClick}
                    data-testid="field-location-more-button"
                >
                    <MoreIcon />
                </button>
            )
           }
        </div>
    );
};
