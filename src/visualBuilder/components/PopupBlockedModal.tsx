import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import React from "preact/compat";
import classNames from "classnames";
import { popupBlockedModalStyles } from "./PopupBlockedModal.style";

interface PopupBlockedModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function PopupBlockedModal({
    isOpen,
    onClose,
}: PopupBlockedModalProps): JSX.Element | null {
    const handleClose = () => {
        onClose();
    };

    const handleBackdropClick = (e: any) => {
        if (e.target === e.currentTarget) {
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className={classNames(
                popupBlockedModalStyles()["popup-blocked-modal__backdrop"],
                {
                    [popupBlockedModalStyles()[
                        "popup-blocked-modal__backdrop--visible"
                    ]]: isOpen,
                }
            )}
            onClick={handleBackdropClick}
            data-testid="popup-blocked-modal-backdrop"
        >
            <div
                className={classNames(
                    popupBlockedModalStyles()["popup-blocked-modal"],
                    {
                        [popupBlockedModalStyles()[
                            "popup-blocked-modal--visible"
                        ]]: isOpen,
                    }
                )}
                data-testid="popup-blocked-modal"
            >
                <div
                    className={
                        popupBlockedModalStyles()["popup-blocked-modal__header"]
                    }
                >
                    <h3
                        className={
                            popupBlockedModalStyles()[
                                "popup-blocked-modal__title"
                            ]
                        }
                    >
                        Popup Blocked
                    </h3>
                </div>
                <div
                    className={
                        popupBlockedModalStyles()[
                            "popup-blocked-modal__content"
                        ]
                    }
                >
                    <p>
                        Your browser has blocked a popup window. Please allow
                        popups for this site to continue.
                    </p>
                </div>
                <div
                    className={
                        popupBlockedModalStyles()["popup-blocked-modal__footer"]
                    }
                >
                    <button
                        onClick={handleClose}
                        className={
                            popupBlockedModalStyles()[
                                "popup-blocked-modal__button"
                            ]
                        }
                        data-testid="popup-blocked-modal-close-button"
                    >
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
}
