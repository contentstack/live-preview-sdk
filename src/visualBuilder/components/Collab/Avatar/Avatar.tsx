/** @jsxImportSource preact */
import React from "preact/compat";
import Tooltip from "../Tooltip/Tooltip";
import classNames from "classnames";
import { collabStyles } from "../../../visualBuilder.style";

const defaultProps = {
    avatar: {},
    type: "text",
    testId: "cs-avatar",
};

type DefaultProps = Readonly<typeof defaultProps>;

export type AvatarProps = {
    avatar: AvatarData;
    type?: "text" | "image";
    testId?: string;
} & Partial<DefaultProps>;

export type AvatarData = {
    id: number;
    name: string;
    image?: string;
    email?: string;
};

interface DisplayAvatarContentProps {
    type: "text" | "image";
    avatar: AvatarData;
}

function displayAvatarContent({
    type,
    avatar,
}: DisplayAvatarContentProps): JSX.Element | string {
    let nameInitialsShort =
        avatar && avatar.name && avatar.name.substring(0, 2);
    if (type === "image") {
        return (
            <img
                src={avatar.image}
                alt={avatar.name}
                className={classNames(
                    "collab-avatar__image",
                    collabStyles()["collab-avatar__image"]
                )}
            />
        );
    }
    return nameInitialsShort;
}

function Avatar({ avatar, type, testId }: AvatarProps) {
    return (
        <Tooltip
            content={avatar.name || avatar.email || ""}
            position="bottom"
            data-test-id={testId}
        >
            <div
                className={classNames(
                    "collab-avatar",
                    "collab-avatar--single",
                    "flex-v-center",
                    collabStyles()["collab-avatar"],
                    collabStyles()["collab-avatar--single"],
                    collabStyles()["flex-v-center"]
                )}
            >
                <span
                    className={classNames(
                        "collab-avatar__link",
                        "flex-v-center",
                        collabStyles()["collab-avatar__link"],
                        collabStyles()["flex-v-center"]
                    )}
                >
                    {displayAvatarContent({ type: type || "text", avatar })}
                </span>
            </div>
        </Tooltip>
    );
}

Avatar.defaultProps = defaultProps;

export default Avatar;
