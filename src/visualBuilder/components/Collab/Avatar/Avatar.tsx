/** @jsxImportSource preact */
import React from "preact/compat";
import Tooltip from "../Tooltip/Tooltip";
import classNames from "classnames";
import { collabStyles, flexAlignCenter } from "../../../collab.style";

export type AvatarProps = {
    avatar: AvatarData;
    type?: "text" | "image";
    testId?: string;
};

export type AvatarData = {
    id: number;
    name: string;
    image?: string;
    email?: string;
};

interface DisplayAvatarContentProps {
    type: "text" | "image";
    avatar: AvatarData;
    initials: string;
}

function getInitials(name?: string): string {
    if (!name) return "";

    const nameParts = name.trim().split(" ");

    if (nameParts.length === 1) {
        return name.substring(0, 2);
    }

    return nameParts[0][0] + nameParts[nameParts.length - 1][0];
}

function DisplayAvatarContent({
    type,
    avatar,
    initials,
}: DisplayAvatarContentProps) {
    if (type === "image" && avatar.image) {
        return (
            <img
                data-testid={"collab-avatar-image"}
                src={avatar.image}
                alt={avatar.name}
                className={classNames(
                    "collab-avatar__image",
                    collabStyles()["collab-avatar__image"]
                )}
            />
        );
    }
    return <span className={`collab-avatar-link__initials`}>{initials}</span>;
}

function Avatar({
    avatar,
    type = "text",
    testId = "collab-avatar",
}: AvatarProps) {
    const initials = getInitials(avatar.name);
    return (
        <div data-testid={testId}>
            <Tooltip
                content={avatar.name || avatar.email || ""}
                position="bottom"
            >
                <div
                    className={classNames(
                        "collab-avatar",
                        "collab-avatar--single",
                        "flex-v-center",
                        collabStyles()["collab-avatar"],
                        collabStyles()["collab-avatar--single"],
                        flexAlignCenter
                    )}
                >
                    <span
                        className={classNames(
                            "collab-avatar__link",
                            "flex-v-center",
                            collabStyles()["collab-avatar__link"],
                            flexAlignCenter
                        )}
                    >
                        <DisplayAvatarContent
                            type={type}
                            avatar={avatar}
                            initials={initials}
                        />
                    </span>
                </div>
            </Tooltip>
        </div>
    );
}

export default Avatar;
