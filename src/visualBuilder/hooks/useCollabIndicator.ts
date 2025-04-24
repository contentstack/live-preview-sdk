/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { IActiveThread } from "../types/collab.types";
import Config from "../../configManager/configManager";
import { calculatePopupPosition } from "../generators/generateThread";
import { handleEmptyThreads } from "../generators/generateThread";
import { toggleCollabPopup } from "../generators/generateThread";

interface UseCollabPopupProps {
    newThread?: boolean;
    thread?: IActiveThread;
}

export const useCollabIndicator = ({
    newThread,
    thread,
}: UseCollabPopupProps) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);
    const config = Config.get();

    const [showPopup, setShowPopup] = useState(newThread || false);
    const [activeThread, setActiveThread] = useState<IActiveThread>(() => {
        if (newThread) return { _id: "new" };
        return thread || { _id: "new" };
    });

    const updatePopupPosition = () => {
        if (buttonRef.current && popupRef.current) {
            calculatePopupPosition(buttonRef.current, popupRef.current);
        }
    };

    useEffect(() => {
        if (!showPopup) return;
        updatePopupPosition();
    }, [showPopup]);

    useEffect(() => {
        const handleTogglePopup = (event: Event) => {
            const { threadUid, action } = (event as CustomEvent).detail;

            const thread = document.querySelector(
                `div[threaduid='${threadUid}']`
            );

            handleEmptyThreads();
            const closestDiv = buttonRef.current?.closest("div[field-path]");
            if (closestDiv) {
                (closestDiv as HTMLElement).style.zIndex = "999";
            }
            setShowPopup(false);

            if (
                action === "open" &&
                thread &&
                thread.contains(buttonRef.current)
            ) {
                setShowPopup(true);
                const closestDiv =
                    buttonRef.current?.closest("div[field-path]");
                thread.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
                if (closestDiv) {
                    (closestDiv as HTMLElement).style.zIndex = "1000";
                }

                if (config?.collab?.isFeedbackMode === true) {
                    Config.set("collab.isFeedbackMode", false);
                }
            }
        };

        document.addEventListener("toggleCollabPopup", handleTogglePopup);

        return () => {
            document.removeEventListener(
                "toggleCollabPopup",
                handleTogglePopup
            );
        };
    }, []);

    const togglePopup = () => {
        if (!showPopup) {
            toggleCollabPopup({ threadUid: "", action: "close" });
            setShowPopup(true);
            const closestDiv = buttonRef.current?.closest("div[field-path]");
            if (closestDiv) {
                (closestDiv as HTMLElement).style.zIndex = "1000";
            }
        } else {
            setShowPopup(false);
            const closestDiv = buttonRef.current?.closest("div[field-path]");
            if (!closestDiv?.hasAttribute("threaduid")) closestDiv?.remove();

            if (config?.collab?.isFeedbackMode === false) {
                Config.set("collab.isFeedbackMode", true);
            }
        }
    };

    return {
        buttonRef,
        popupRef,
        showPopup,
        setShowPopup,
        activeThread,
        setActiveThread,
        togglePopup,
    };
};
