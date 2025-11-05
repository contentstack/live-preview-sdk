import { css } from "goober";

export function popupBlockedModalStyles() {
    return {
        "popup-blocked-modal__backdrop": css`
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2147483647;
            transition: background-color 0.2s ease-in-out;
            font-family: "Inter", sans-serif;
        `,
        "popup-blocked-modal__backdrop--visible": css`
            background-color: rgba(0, 0, 0, 0.5);
        `,
        "popup-blocked-modal": css`
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            max-width: 480px;
            width: 90%;
            margin: 0 16px;
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
            transition: all 0.2s ease-in-out;
        `,
        "popup-blocked-modal--visible": css`
            opacity: 1;
            transform: scale(1) translateY(0);
        `,
        "popup-blocked-modal__header": css`
            padding: 24px 24px 16px;
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #e0e0e0;
        `,
        "popup-blocked-modal__icon": css`
            flex-shrink: 0;
        `,
        "popup-blocked-modal__title": css`
            margin: 0;
            font-size: 20px;
            font-weight: 600;
            color: #2c3e50;
            line-height: 1.2;
        `,
        "popup-blocked-modal__content": css`
            padding: 24px;
            color: #475161;
            font-size: 14px;
            line-height: 1.6;
            border-bottom: 1px solid #e0e0e0;

            p {
                margin: 0 0 16px 0;

                &:last-child {
                    margin-bottom: 0;
                }
            }
        `,
        "popup-blocked-modal__instructions": css`
            background: #f5f5f5;
            padding: 16px;
            border-radius: 6px;
            border-left: 3px solid #715cdd;
            font-size: 13px;
        `,
        "popup-blocked-modal__footer": css`
            padding: 16px 24px 24px;
            display: flex;
            justify-content: flex-end;
        `,
        "popup-blocked-modal__button": css`
            background: #715cdd;
            color: #ffffff;
            border: none;
            border-radius: 6px;
            padding: 10px 24px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: background-color 0.2s ease-in-out;
            font-family: "Inter", sans-serif;

            &:hover {
                background: #5a47b8;
            }

            &:active {
                background: #4a3a94;
            }

            &:focus {
                outline: 2px solid #715cdd;
                outline-offset: 2px;
            }
        `,
    };
}
