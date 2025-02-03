/** @jsxImportSource preact */
import React from "preact/compat";
import { useState, useRef, useEffect } from "preact/hooks";
import { IActiveThread } from "../types/collab.types";
import Config from "../../configManager/configManager";

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

    const calculatePopupPosition = () => {
        if (!buttonRef.current || !popupRef.current) return;

        const buttonRect = buttonRef.current.getBoundingClientRect();
        const popupHeight = 422;
        const popupWidth = 334;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;

        const spaceAbove = buttonRect.top;
        const spaceBelow = viewportHeight - buttonRect.bottom;

        let top, left;

        if (spaceAbove >= popupHeight) {
            top = buttonRect.top - popupHeight - 8;
        } else {
            top = buttonRect.bottom + 8;
        }

        left = buttonRect.left + buttonRect.width / 2 - popupWidth / 2;

        top = Math.max(top, 0);
        left = Math.max(left, 0);
        left = Math.min(left, viewportWidth - popupWidth);

        popupRef.current.style.top = `${top}px`;
        popupRef.current.style.left = `${left}px`;
    };

    useEffect(() => {
        if (!showPopup) return;
        calculatePopupPosition();
    }, [showPopup]);

    const togglePopup = () => {
        if (!showPopup) {
            document.dispatchEvent(new CustomEvent("closeCollabPopup"));
            setShowPopup(true);
        } else {
            setShowPopup(false);
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
