import React from "react";
import { EmptyAppIcon } from "./icons/EmptyAppIcon";

interface App {
    uid: string;
    title: string;
    name: string;
    icon?: string;
    visible: boolean;
}

interface FieldLocationAppListProps {
    apps: App[];
}

export const FieldLocationAppList: React.FC<FieldLocationAppListProps> = ({ apps }) => {
    if (!apps || apps.length === 0) {
        return null;
    }

    return (
        <div
            style={{
                position: "absolute",
                top: 0,
                left: "100%",
                backgroundColor: "white",
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                zIndex: 1000,
                minWidth: "200px",
                maxHeight: "300px",
                overflowY: "auto",
                padding: "8px 0",
                marginLeft: "8px",
            }}
        >
            {apps.map((app) => (
                <div
                    key={app.uid}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                    onClick={() => {
                        console.log("App clicked:", app);
                    }}
                >
                    <div
                        style={{
                            width: "16px",
                            height: "16px",
                            marginRight: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {app.icon ? (
                            <img
                                src={app.icon}
                                alt={app.title}
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    objectFit: "cover",
                                }}
                            />
                        ) : (
                            <EmptyAppIcon />
                        )}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div
                            style={{
                                fontSize: "12px",
                                fontWeight: "500",
                                color: "#333",
                            }}
                        >
                            {app.title}
                        </div>
                        <div
                            style={{
                                fontSize: "11px",
                                color: "#666",
                            }}
                        >
                            {app.name}
                        </div>
                    </div>
                  
                </div>
            ))}
        </div>
    );
};