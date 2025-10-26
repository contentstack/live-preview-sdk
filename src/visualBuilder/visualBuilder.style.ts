import { css } from "goober";

const tooltipBaseStyle = `
    pointer-events: all;
    svg {
        pointer-events: none;
    }
    &:before {
        content: attr(data-tooltip);
        position: absolute;
        bottom: 20px;
        margin-bottom: 24px;
        padding: 12px;
        border-radius: 4px;
        width: max-content;
        max-width: 200px;
        color: #fff;
        font-family: Inter;
        font-size: 0.75rem;
        font-style: normal;
        font-weight: 400;
        line-height: 132%; /* 0.99rem */
        letter-spacing: 0.015rem;
        background: #767676;
    }
    &:after {
        content: "";
        position: absolute;
        bottom: 28px;
        /* the arrow */
        border: 10px solid #000;
        border-color: #767676 transparent transparent transparent;
    }
`;

export function visualBuilderStyles() {
    return {
        "visual-builder__container": css`
            --outline-transition: all 0.15s ease-in;
            font-family: "Inter", sans-serif;
        `,
        "visual-builder__cursor": css`
            visibility: hidden;
            height: 0;

            &.visible {
                visibility: visible;
                position: fixed;
                top: 0;
                left: 0;
                z-index: 2147483647 !important;

                color: #fff;

                height: auto;
                padding: 0 10px;

                display: flex;
                align-items: center;
                justify-content: center;

                pointer-events: none !important;
                position: fixed !important;
                cursor: none;
            }
        `,
        "tooltip-container": css`
            position: absolute;
            background-color: #767676;
            color: white;
            padding: 12px;
            border-radius: 4px;
            font-size: 12px;
            line-height: 1.4;
            z-index: 1000;
            pointer-events: none;
            max-width: 250px;
            text-align: center;
        `,
        "tooltip-arrow": css`
            position: absolute;
            background: #767676;
            width: 8px;
            height: 8px;
            transform: rotate(45deg);
        `,
        "toolbar-tooltip-content": css`
            display: flex;
            flex-direction: column;
            gap: 4px;
        `,
        "toolbar-tooltip-content-item": css`
            display: flex;
            align-items: center;
            justify-content: start;
            gap: 4px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;

            p {
                margin: 0;
                color: #fff;
                overflow: hidden;
                text-overflow: ellipsis;
                max-width: 100%;
            }
        `,
        "visual-builder__overlay__wrapper": css`
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100vh;
            visibility: hidden;
            z-index: 99999;

            pointer-events: none;

            &.visible {
                visibility: visible;
            }
        `,
        "visual-builder__empty-block-plus-icon": css`
            font-size: 22px;
            font-weight: 300;
            display: flex;
            align-items: center;
            justify-content: center;
        `,
        "visual-builder__overlay--outline": css`
            position: absolute;
            outline: 4px solid #715cdd;
            transition: var(--outline-transition);
        `,
        "visual-builder__overlay": css`
            background: rgba(0, 0, 0, 0.3);
            box-sizing: content-box;
            pointer-events: all;
            position: absolute;
            transition: var(--outline-transition);
        `,
        "visual-builder__add-button": css`
            position: absolute;
            pointer-events: all;

            background: #ffffff;
            color: #475161;

            border-radius: 4px;
            border: 1px solid #6c5ce7;

            height: 32px;
            min-width: 32px;
            max-width: 180px;
            padding: 8px 6px;
            transform: translate(-50%, -50%);

            font-weight: 600;
            color: #6c5ce7;
            overflow: hidden;

            z-index: 2147483646 !important;

            display: grid;
            grid-template-columns: min-content 0fr;
            align-content: center;
            gap: 0;

            transition:
                grid-template-columns 0.25s,
                left 0.15s ease-in,
                top 0.15s ease-in,
                gap 0.15s ease-in;

            &:has(.visual-builder__add-button-label):hover {
                grid-template-columns: min-content 1fr;
                gap: 8px;
                padding: 8px 16px;
            }

            svg {
                fill: #6c5ce7;
            }

            &:disabled {
                border-color: #bbbec3;
                cursor: not-allowed;
            }

            &:disabled svg {
                fill: #bbbec3;
            }
        `,
        "visual-builder__add-button-label": css`
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `,
        "visual-builder__add-button--loading": css`
            cursor: wait;
            /* we have not-allowed on disabled, so we need this */
            &:disabled {
                cursor: wait;
            }
        `,
        "visual-builder__start-editing-btn": css`
            z-index: 1000;
            text-decoration: none;
            position: fixed;
            box-shadow:
                0px 4px 15px 0px rgba(108, 92, 231, 0.2),
                0px 3px 14px 3px rgba(0, 0, 0, 0.12),
                0px 8px 10px 1px rgba(0, 0, 0, 0.14);
            display: inline-flex;
            padding: 0.5rem 1rem;
            justify-content: center;
            align-items: center;
            gap: 0.5rem;

            border-radius: 4px;
            border: 1px solid transparent;
            background: #6c5ce7;
            transition:
                background-color 0.15s ease-in-out,
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out,
                -webkit-box-shadow 0.15s ease-in-out;

            &:hover {
                background-color: #5d50be;
            }
            &:focus {
                outline: none;
                box-shadow: 0 0 0 2px #ada4f4;
            }
            & > span {
                color: #fff;
                /* Body/P1 Bold */
                font-size: 1rem;
                font-family: Inter;
                font-weight: 600;
                line-height: 150%;
                letter-spacing: 0.01rem;
                text-transform: capitalize;
            }

            & > svg {
                color: #fff;
                font-size: 1rem;
                font-family: Inter;
                font-weight: 600;
                line-height: 150%;
                letter-spacing: 0.01rem;
                text-transform: capitalize;
            }
        `,
        "visual-builder__start-editing-btn__bottom-right": css`
            bottom: 30px;
            right: 30px;
        `,
        "visual-builder__start-editing-btn__bottom-left": css`
            bottom: 30px;
            left: 30px;
        `,
        "visual-builder__start-editing-btn__top-right": css`
            top: 30px;
            right: 30px;
        `,
        "visual-builder__start-editing-btn__top-left": css`
            top: 30px;
            left: 30px;
        `,
        "visual-builder__cursor-icon": css`
            height: 40px;
            width: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #5d50be;
            border-radius: 50%;
            position: absolute;
            top: 0;
            left: 0;
        `,
        "visual-builder__cursor-pointer": css`
            position: absolute;
            top: -8px;
            left: -8px;
        `,
        "visual-builder__cursor-icon--loader": css`
            animation: visual-builder__spinner 1s linear infinite;
        `,
        "visual-builder__variant-indicator": css`
            height: calc(100% - 1px);
            aspect-ratio: 1;
            background: white;
            border-radius: 2px;
            border-width: 2px;
            border-style: solid;
            align-content: center;
            text-align: center;
            border-color: #BD59FA;

            svg {
                color: #BD59FA;
            }
        `,
        "visual-builder__focused-toolbar": css`
            position: absolute;
            transform: translateY(-100%);
            z-index: 100000;
            gap: 8px;
            width: 0;
            display: flex;
            align-items: end;
            transition: var(--outline-transition);
        `,
        "visual-builder__focused-toolbar__field-label-wrapper__current-field": css`
            padding: 4px 8px !important;
            background: #6c5ce7;
            color: #fff;
            z-index: 1;
            border-radius: 2px !important;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: fit-content;

            &:disabled {
                filter: contrast(0.7);
            }

            .visual-builder__focused-toolbar__text {
                padding-right: 3px;
                height: 16px;
            }
        `,
        "visual-builder__focused-toolbar__field-label-wrapper__parent-field": css`
            pointer-events: none;
            color: #5d50be;
            padding: 4px !important;
            margin-bottom: 3px;
            display: none;
            width: fit-content;
            position: absolute;
            z-index: 100000;
        `,
        "field-label-dropdown-open": css`
            .visual-builder__focused-toolbar__field-label-wrapper__parent-field {
                pointer-events: all;
                visibility: visible;
                display: initial;
            }

            .visual-builder__button--secondary:hover {
                background-color: #6c5ce7;
                color: #f9f8ff;
            }
        `,
        "visual-builder__focused-toolbar__field-label-wrapper": css`
            display: flex;
            flex-direction: column-reverse;
            position: relative;
            margin-right: 0.5rem;
        `,
        "visual-builder__focused-toolbar__field-label-container": css`
            display: flex;
            height: 1.75rem;
            align-items: center;
        `,
        "visual-builder__button": css`
            background-color: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            font-size: 16px;
            font-weight: 600;
            line-height: 100%;
            padding: 8px 16px;
            text-align: center;
            z-index: 2147483647 !important;
            transition:
                color 0.15s ease-in-out,
                background-color 0.15s ease-in-out,
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out;
            // vertical-align: middle;
            &:disabled {
                cursor: not-allowed;
                svg {
                    fill: #999;
                    path {
                        fill: #999;
                    }
                }
            }
        `,
        "visual-builder__button--primary": css`
            background-color: #6c5ce7;
            color: #fff;

            &:hover {
                background-color: #5d50be;
            }
        `,
        "visual-builder__button--secondary": css`
            background-color: #f9f8ff;
            border: 1px solid #6c5ce7;
            color: #6c5ce7;
        `,
        "visual-builder__button--edit": css`
            svg {
                height: 16px;
                width: 16px;

                path {
                    fill: #475161;
                }
            }
        `,
        "visual-builder__button-loader": css`
            svg.loader {
                height: 16px;
                width: 16px;

                path {
                    fill: #ffffff;
                }
            }
        `,
        "visual-builder__button--comment-loader": css`
            cursor: wait !important;
            svg.loader {
                height: 16px;
                width: 16px;

                path {
                    fill: #475161;
                }
            }
        `,
        "visual-builder__field-icon": css`
            svg {
                height: 16px;
                width: 16px;
                margin-right: 3px;
            }
        `,
        "visual-builder__content-type-icon": css`
            svg {
                height: 16px;
                width: 16px;
                margin-right: 3px;
            }
        `,
        "visual-builder__caret-right-icon": css`
            svg {
                height: 16px;
                width: 16px;
            }
        `,
        "visual-builder__reference-icon-container": css`
            display: flex;
            align-items: center;

            .visual-builder__field-icon {
                svg {
                    margin-right: 0px;
                }
            }
        `,
        "visual-builder__focused-toolbar__button-group": css`
            display: flex;
            background: #fff;
            border-radius: 2px;
            height: 100%;
            padding: 4px !important;
            z-index: 2147483647 !important;

            &:has(.visual-builder__button) {
                padding: 2px;
                gap: 8px;
            }

            .visual-builder__button:enabled:hover {
                background-color: #f5f5f5;

                svg {
                    color: #5d50be;
                }
            }

            .visual-builder__button {
                background-color: #fff;
                border-color: transparent;
                color: #475161;
                padding: 4px;
                min-width: 32px;
                min-height: 32px;
            }
        `,
        "visual-builder__focused-toolbar__text": css`
            font-family: Inter, "sans-serif";
            font-size: 0.75rem;
            font-style: normal;
            font-weight: 400;
            line-height: 150%;
            letter-spacing: 0.015rem;
            max-width: 150px;
            overflow: hidden;
            text-overflow: ellipsis;
            text-wrap: nowrap;
        `,
        "visual-builder__focused-toolbar__multiple-field-toolbar": css`
            height: 40px;
            z-index: 2147483647 !important;

            svg {
                height: 100%;
                width: 100%;
            }
        `,
        "visual-builder__rotate--90": css`
            transform: rotate(90deg);
        `,
        "visual-builder__focused-toolbar--field-disabled": css`
            pointer-events: none;
            cursor: not-allowed;
            .visual-builder__focused-toolbar__field-label-wrapper__current-field {
                background: #909090;
            }
        `,
        "visual-builder__focused-toolbar--variant": css`
            .visual-builder__focused-toolbar__field-label-wrapper__current-field {
                background: #BD59FA;
            }

        `,
        "visual-builder__cursor-disabled": css`
            .visual-builder__cursor-icon {
                background: #909090;
            }

            .visual-builder__cursor-pointer path {
                fill: #909090;
            }
        `,
        "visual-builder__tooltip": css`
            ${tooltipBaseStyle}

            &:before {
                display: none;
            }

            &:hover:before,
            &:hover:after {
                display: block;
                z-index: 2147483647 !important;
            }

            &:after {
                display: none;
            }
        `,
        "visual-builder__tooltip--bottom": css`
            &:before {
                bottom: -66px;
            }
            &:after {
                bottom: -6px;
                transform: rotate(180deg);
            }
        `,

        "visual-builder__tooltip--persistent": css`
            ${tooltipBaseStyle}

            &:before {
                display: block;
            }

            &:after {
                display: block;
            }
        `,
        "visual-builder__empty-block": css`
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 1rem;
            min-height: 100px;
        `,
        "visual-builder__empty-block-title": css`
            font-size: 0.95rem;
            font-family: Inter;
            font-weight: 400;
            line-height: 100%;
            color: #647696;
        `,
        "visual-builder__empty-block-field-name": css`
            font-weight: 700;
        `,
        "visual-builder__empty-block-add-button": css`
            height: 32px;
            border-radius: 4px;
            background: #f9f8ff;
            border-color: #6c5ce7;
            border-width: 1px;
            padding: 0 16px;
            font-size: 0.9rem;
            font-family: Inter;
            font-weight: 600;
            color: #6c5ce7;
            letter-spacing: 0.01rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        `,
        "visual-builder__hover-outline": css`
            position: absolute;
            outline: 2px dashed #6c5ce7;
            transition: var(--outline-transition);
            z-index: 2147483646 !important;
        `,
        "visual-builder__hover-outline--hidden": css`
            visibility: hidden;
        `,
        "visual-builder__hover-outline--unclickable": css`
            pointer-events: none;
        `,
        "visual-builder__hover-outline--disabled": css`
            outline: 2px dashed #909090;
        `,
        "visual-builder__hover-outline--variant": css`
            outline: 2px dashed #BD59FA;
        `,
        "visual-builder__default-cursor--disabled": css`
            cursor: none;
        `,
        "visual-builder__draft-field": css`
            outline: 2px dashed #eb5646;
        `,
        "visual-builder__variant-field": css`
            outline: 2px solid #bd59fa;
            outline-offset: -2px;
        `,
        "visual-builder__pseudo-editable-element": css`
            z-index: 99999 !important;
        `,
        // cslp error styles
        "visual-builder__button-error": css`
            background-color: #ffeeeb;
            padding: 0px !important;
            &:hover {
                background-color: #ffeeeb;
            }
        `,
        "visual-builder__focused-toolbar__error": css`
            display: flex;
            justify-content: center;
            align-items: center;
            column-gap: 3px;
            padding: 4px 8px;
        `,
        "visual-builder__focused-toolbar__error-text": css`
            font-weight: 400;
            font-size: 12px;
            line-height: 18px;
            color: #a31b00;
        `,
        "visual-builder__focused-toolbar__error-toolip": css`
            position: absolute;
            width: 400px;
            background-color: red;
            left: 0;
            top: -7px;
            transform: translateY(-100%);
            background-color: #767676;
            border-radius: 4px;
            box-shadow:
                0px 1px 10px 0px #6c5ce733,
                0px 5px 5px 0px #0000001f,
                0px 2px 4px 0px #00000024;
            padding: 12px;
            text-align: left;

            &:before {
                content: "";
                position: absolute;
                bottom: -3px;
                left: 4%;
                transform: translateX(-50%) rotate(45deg);
                width: 10px;
                height: 10px;
                background-color: #767676;
            }

            > p {
                margin: 0;
                color: #ffffff;
                font-size: 14px;
                font-weight: 600;
                line-height: 21px;
                margin-bottom: 4px;
            }

            > span {
                color: #ffffff;
                font-size: 12px;
                font-weight: 400;
                line-height: 18px;
            }
        `,
        "variant-field-revert-component": css`
            position: relative;
            display: inline-block;
            z-index: 2147483647 !important;
        `,
        "variant-field-revert-component__dropdown-content": css`
            position: absolute;
            top: -12px;
            left: -4px;
            background-color: #ffffff;
            min-width: max-content;
            box-shadow:
                0 4px 15px 0 rgba(108, 92, 231, 0.2),
                0 3px 14px 3px rgba(0, 0, 0, 0.12),
                0 8px 10px 1px rgba(0, 0, 0, 0.14);
            z-index: 2147483647 !important;
            margin-top: 4px;
            padding: 4px 0px;
            border-radius: 2px;
        `,
        "variant-field-revert-component__dropdown-content__list-item": css`
            color: black;
            font-weight: 400;
            padding: 9.6px 16px;
            text-decoration: none;
            display: block;
            font-size: 0.75rem;
            height: 32px;
            line-height: 2rem;
            display: flex;
            align-items: center;
            z-index: 2147483647 !important;
            cursor: pointer;
            &:hover {
                background-color: #f1f1f1;
            }
            &:hover > span {
                color: #5d50be;
            }
            & > span {
                margin-top: 4px;
                margin-bottom: 4px;
            }
        `,
        "visual-builder__no-cursor-style": css`
            cursor: none !important;
        `,
        "visual-builder__field-toolbar-container": css`
            display: flex;
            flex-direction: column-reverse;
            z-index: 2147483647 !important;
            position: relative;
        `,
        "visual-builder__variant-button": css`
            display: flex;
            min-width: 3rem !important;
            gap: 0.25rem;
            align-items: center;
            justify-content: center;
            display: flex;
            & svg path {
                fill: #475161;
            }
        `,
        "visual-builder__field-location-icons-container": css`
            display: flex;
            gap: 0.25rem;
            align-items: center;
            justify-content: center;
            margin-left: 0.25rem;
        `,
        "visual-builder__field-location-icons-container__divider": css`
            height: 32px !important;
            width: 1px;
            border-radius: 2px;
            background-color: #8a8f99;
        `,
        "visual-builder__field-location-icons-container__app-icon": css`
            width: 24px;
            height: 24px;
            object-fit: cover;
        `,
        "visual-builder__field-location-app-list": css`
            position: absolute;
            top: 0;
            background: #fff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            min-width: 230px;
            max-height: 250px;
            min-height: 250px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        `,
        "visual-builder__field-location-app-list--left": css`
            right: 100%;
            margin-right: 8px;
        `,
        "visual-builder__field-location-app-list--right": css`
            left: 100%;
            margin-left: 8px;
        `,
        "visual-builder__field-location-app-list__search-container": css`
            display: flex;
            align-items: center;
            padding: 10px 16px 0px 16px;
            border: none;
            border-bottom: 1px solid #f0f0f0;
        `,
        "visual-builder__field-location-app-list__search-input": css`
            width: 100%;
            padding: 10px 12px;
            font-size: 14px;
            outline: none;
            box-sizing: border-box;
            border: none;
        `,
        "visual-builder__field-location-app-list__search-icon": css`
            width: 14px;
            height: 14px;
        `,
        "visual-builder__field-location-app-list__content": css`
            flex: 1;
            overflow-y: auto;
        `,
        "visual-builder__field-location-app-list__no-results": css`
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100%;
            width: 100%;
            text-align: center;
        `,
        "visual-builder__field-location-app-list__no-results-text": css`
            color: #373b40;
            font-weight: 400;
        `,
        "visual-builder__field-location-app-list__item": css`
            display: flex;
            align-items: center;
            padding: 10px 16px;
            cursor: pointer;
            font-size: 14px;
        `,
        "visual-builder__field-location-app-list__item-icon-container": css`
            width: 24px;
            height: 24px;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        `,
        "visual-builder__field-location-app-list__item-icon": css`
            width: 24px;
            height: 24px;
            border-radius: 50%;
            object-fit: cover;
        `,
        "visual-builder__field-location-app-list__item-title": css`
            color: #373b40;
            font-weight: 400;
        `,
    };
}

export const VisualBuilderGlobalStyles = `
       @import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

       [data-cslp] [contenteditable="true"] {
            outline: none;
        }

        @keyframes visual-builder__spinner {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }

`;
