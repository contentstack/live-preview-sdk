import React, { useState, useEffect, useMemo } from "preact/compat";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";
import { VisualBuilderPostMessageEvents } from "../utils/types/postMessage.types";
import visualBuilderPostMessage from "../utils/visualBuilderPostMessage";
import { visualBuilderStyles } from "../visualBuilder.style";
import classNames from "classnames";
import { CslpData } from "../../utils/cslpdata";

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
    toolbarRef: React.RefObject<HTMLDivElement>;
    domEditStack:CslpData[]
    setDisplayAllApps: (displayAllApps: boolean) => void;
    displayAllApps: boolean;
}

const normalize = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9 ]/gi, "")
        .trim();

export const FieldLocationAppList = ({
    apps,
    position,
    toolbarRef,
    domEditStack,
    setDisplayAllApps,
}: FieldLocationAppListProps) => {
    const remainingApps = apps.filter((app, index) => index !== 0);
    const [search, setSearch] = useState("");

    const filteredApps = useMemo(() => {
        if (!search.trim()) return remainingApps;

        const normalizedSearch = normalize(search);
        return remainingApps.filter((app) => {
            return (
                normalize(app.title).includes(normalizedSearch) 
            );
        });
    }, [search, remainingApps]);

    const handleAppClick = (app: App) => {
        visualBuilderPostMessage?.send(
            VisualBuilderPostMessageEvents.FIELD_LOCATION_SELECTED_APP,
            {
                app: app,
                position: toolbarRef.current?.getBoundingClientRect(),
                DomEditStack:domEditStack
            }
        );
        setDisplayAllApps(false);
    };

    return (
        <div
            className={classNames(
                visualBuilderStyles()[
                    "visual-builder__field-location-app-list"
                ],
                {
                    [visualBuilderStyles()[
                        "visual-builder__field-location-app-list--left"
                    ]]: position === "left",
                    [visualBuilderStyles()[
                        "visual-builder__field-location-app-list--right"
                    ]]: position === "right",
                }
            )}
        >
            <div
                className={
                    visualBuilderStyles()[
                        "visual-builder__field-location-app-list__search-container"
                    ]
                }
            >
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className={classNames(
                        "Search__search-icon Icon--mini",
                        visualBuilderStyles()[
                            "visual-builder__field-location-app-list__search-icon"
                        ]
                    )}
                >
                    <path
                        d="M12.438 12.438L9.624 9.624M6.25 10.75a4.5 4.5 0 100-9 4.5 4.5 0 000 9z"
                        stroke="#A9B6CB"
                        strokeWidth="2"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    ></path>
                </svg>
                <input
                    type="text"
                    value={search}
                    onInput={(e) =>
                        setSearch((e.target as HTMLInputElement).value)
                    }
                    placeholder="Search for Apps"
                    className={
                        visualBuilderStyles()[
                            "visual-builder__field-location-app-list__search-input"
                        ]
                    }
                />
            </div>

            <div
                className={
                    visualBuilderStyles()[
                        "visual-builder__field-location-app-list__content"
                    ]
                }
            >
                {filteredApps.length === 0 && (
                    <div
                        className={
                            visualBuilderStyles()[
                                "visual-builder__field-location-app-list__no-results"
                            ]
                        }
                    >
                        <span
                            className={
                                visualBuilderStyles()[
                                    "visual-builder__field-location-app-list__no-results-text"
                                ]
                            }
                        >
                            No matching results found!
                        </span>
                    </div>
                )}
                {filteredApps.map((app) => (
                    <div
                        key={app.uid}
                        className={
                            visualBuilderStyles()[
                                "visual-builder__field-location-app-list__item"
                            ]
                        }
                        onClick={() => handleAppClick(app)}
                    >
                        <div
                            className={
                                visualBuilderStyles()[
                                    "visual-builder__field-location-app-list__item-icon-container"
                                ]
                            }
                        >
                            {app.icon ? (
                                <img
                                    src={app.icon}
                                    alt={app.title}
                                    className={
                                        visualBuilderStyles()[
                                            "visual-builder__field-location-app-list__item-icon"
                                        ]
                                    }
                                />
                            ) : (
                                <EmptyAppIcon id={app.app_installation_uid} />
                            )}
                        </div>
                        <span
                            className={
                                visualBuilderStyles()[
                                    "visual-builder__field-location-app-list__item-title"
                                ]
                            }
                        >
                            {app.title}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
