import React, { useState, useEffect, useRef } from "preact/compat";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { visualBuilderStyles } from "../visualBuilder.style";
import classNames from "classnames";

interface App {
    app_installation_uid: string;
    app_uid: string;
    contentTypeUid: string;
    entryUid: string;
    fieldDataType: string;
    fieldDisplayName: string;
    fieldPath: string;
    icon?: string;
    locale: string;
    manifest: {
        uid: string;
        name: string;
        description: string;
        icon: string;
        visibility: string;
    };
    title: string;
    uid: string;
}


interface FieldLocationAppListProps {
    apps: App[];
    position: "left" | "right";
}

export const FieldLocationAppList = ({ apps, position }: FieldLocationAppListProps) => {
    const [search, setSearch] = useState("");
    const [filteredApps, setFilteredApps] = useState(apps);
    const appRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    useEffect(() => {
        const filtered = apps.filter(app =>
            app.title.toLowerCase().includes(search.toLowerCase())
        );
        setFilteredApps(filtered);
    }, [search, apps]);

    const handleAppClick = (app: App) => {
        const appElement = appRefs.current[app.uid];
        const positionData = appElement?.getBoundingClientRect();
        visualBuilderPostMessage?.send(VisualBuilderPostMessageEvents.FIELD_LOCATION_SELECTED_APP, {
            app: app,
            position: positionData,
        });
    }

    return (
        <div
            className={classNames(
                visualBuilderStyles()["visual-builder__field-location-app-list"],
                {
                    [visualBuilderStyles()["visual-builder__field-location-app-list--left"]]: position === "left",
                    [visualBuilderStyles()["visual-builder__field-location-app-list--right"]]: position === "right",
                }
            )}
        >
            <div className={visualBuilderStyles()["visual-builder__field-location-app-list__search-container"]}>
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={classNames(
                        "Search__search-icon Icon--mini",
                        visualBuilderStyles()["visual-builder__field-location-app-list__search-icon"]
                    )}
                    name="Search"
                    data-test-id="cs-icon"
                >
                    <path
                        d="M12.438 12.438L9.624 9.624M6.25 10.75a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
                        stroke="#A9B6CB"
                        stroke-width="2"
                        stroke-miterlimit="10"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                    ></path>
                </svg>
                <input
                    type="text"
                    value={search}
                    onInput={(e) =>
                        setSearch((e.target as HTMLInputElement).value)
                    }
                    placeholder="Search for Apps"
                    className={visualBuilderStyles()["visual-builder__field-location-app-list__search-input"]}
                />
            </div>
            <div className={visualBuilderStyles()["visual-builder__field-location-app-list__content"]}>
                {filteredApps.length === 0 && (
                    <div className={visualBuilderStyles()["visual-builder__field-location-app-list__no-results"]}>
                        <span className={visualBuilderStyles()["visual-builder__field-location-app-list__no-results-text"]}>
                            No matching results found!
                        </span>
                    </div>
                )}
                {filteredApps
                    .filter((_, index) => index !== 0)
                    .map((app) => (
                        <div
                            key={app.uid}
                            ref={(el) => (appRefs.current[app.uid] = el)}
                            className={visualBuilderStyles()["visual-builder__field-location-app-list__item"]}
                            onClick={() => handleAppClick(app)}
                        >
                            <div className={visualBuilderStyles()["visual-builder__field-location-app-list__item-icon-container"]}>
                                {app.icon ? (
                                    <img
                                        src={app.icon}
                                        alt={app.title}
                                        className={visualBuilderStyles()["visual-builder__field-location-app-list__item-icon"]}
                                    />
                                ) : (
                                    <EmptyAppIcon id={app.app_installation_uid} />
                                )}
                            </div>
                            <span className={visualBuilderStyles()["visual-builder__field-location-app-list__item-title"]}>
                                {app.title}
                            </span>
                        </div>
                    ))}
            </div>
        </div>
    );
};