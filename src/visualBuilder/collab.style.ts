import { css, keyframes } from "goober";

const skeletonTileProgressSlide = keyframes`
    0%, 100% {
        fill: #edf1f7;
    }
    60% {
        opacity: 0.4;
    }
`;

export function collabStyles() {
    return {
        "collab-indicator": css`
            width: 2.25rem;
            height: 2.25rem;
            background-color: gray;
            border-radius: 50% 50% 50% 0%;
            border: 2px solid white;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `,
        "collab-popup": css`
            position: fixed;
            z-index: 1000;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            overflow: auto;
        `,
        "collab-avatar": css`
            background-color: #edf1f7;
            border: 1.5px solid #ffffff;
            border-radius: 50%;
            font-family: Inter;
            font-weight: 600;
            justify-content: center;
            position: relative;
        `,
        "collab-avatar--single": css`
            border: none;
            font-size: 0.6875rem;
            height: 2rem;
            width: 2rem;
            border-radius: 22.5rem;
            border: 0.125rem solid #dde3ee;
            background: #ffffff;
            position: relative;
            overflow: hidden;

            &:hover .collab-avatar__image {
                filter: grayscale(0);
            }
        `,
        "collab-avatar__image": css`
            filter: grayscale(1);
            transition: filter 300ms ease;
            border-radius: 50%;
            height: 0;
            left: 50%;
            min-width: 100%;
            position: absolute;
            top: 50%;
            transform: translate(-50%, -50%);
            width: 0;
        `,
        "collab-avatar__link": css`
            color: #475161;
            cursor: pointer;
            height: 100%;
            justify-content: center;
            overflow: hidden;
            text-decoration: none;
            text-transform: uppercase;
            transition:
                background-color 300ms ease,
                color 300ms ease;
            width: 100%;
            font-weight: 600;
            font-size: 0.75rem;
        `,
        "collab-tooltip--wrapper": css`
            position: relative;
            display: inline-block;
        `,
        "collab-tooltip": css`
            position: fixed;
            z-index: 2147483647 !important;
            padding: 8px 12px;
            font-size: 14px;
            color: #f7f9fc;
            background-color: #767676;
            border-radius: 4px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

            opacity: 0;
            animation: simpleFade 0.15s ease-in forwards;

            @keyframes simpleFade {
                from {
                    opacity: 0;
                }
                to {
                    opacity: 1;
                }
            }
        `,
        "collab-tooltip--top": css`
            &::before {
                content: "";
                position: absolute;
                bottom: -5px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 5px 5px 0;
                border-style: solid;
                border-color: #767676 transparent transparent;
            }
        `,
        "collab-tooltip--bottom": css`
            &::before {
                content: "";
                position: absolute;
                top: -5px;
                left: 50%;
                transform: translateX(-50%);
                border-width: 0 5px 5px;
                border-style: solid;
                border-color: transparent transparent #767676;
            }
        `,
        "collab-tooltip--left": css`
            &::before {
                content: "";
                position: absolute;
                right: -5px;
                top: 50%;
                transform: translateY(-50%);
                border-width: 5px 0 5px 5px;
                border-style: solid;
                border-color: transparent transparent transparent #767676;
            }
        `,
        "collab-tooltip--right": css`
            &::before {
                content: "";
                position: absolute;
                left: -5px;
                top: 50%;
                transform: translateY(-50%);
                border-width: 5px 5px 5px 0;
                border-style: solid;
                border-color: transparent #767676 transparent transparent;
            }
        `,
        "collab-icon": css`
            height: 1.25rem;
            width: 1.25rem;
            cursor: pointer;
        `,
        "collab-icon-wrapper": css`
            padding: 0 0.5rem;
        `,
        "collab-button--basestyle": css`
            box-sizing: border-box;
            -moz-box-sizing: border-box;
            -webkit-box-sizing: border-box;
            background-color: transparent;
            border: 1px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            font-family: Inter, sans-serif;
            font-size: 1rem;
            font-weight: 600;
            line-height: 1;
            min-height: 2rem;
            min-width: 2rem;
            padding: 0.5rem 1rem;
            position: relative;
            text-align: center;
            transition:
                color 0.15s ease-in-out,
                background-color 0.15s ease-in-out,
                border-color 0.15s ease-in-out,
                box-shadow 0.15s ease-in-out;
            vertical-align: middle;
            cursor: pointer;
            opacity: 1;
            pointer-events: auto;
        `,
        "collab-button--disabled": css`
            cursor: not-allowed;
            opacity: 0.4;
            pointer-events: auto;
        `,
        "collab-button--type": {
            primary: css`
                background-color: #6c5ce7 !important;
                color: #ffffff;
                &:hover {
                    background-color: #5d50be !important;
                }
                &:focus {
                    box-shadow: 0px 0px 0px 2px #ada4f4 !important;
                }
                &:active {
                    background-color: #3e3871 !important;
                }
            `,
            secondary: css`
                background-color: #f9f8ff !important;
                border: 1px solid #6c5ce7 !important;
                color: #6c5ce7 !important;
                &:hover {
                    border-color: #5d50be !important;
                    color: #5d50be !important;
                }
                &:focus {
                    box-shadow: 0px 0px 0px 2px #ada4f4 !important;
                }
                &:active {
                    border-color: #3e3871 !important;
                    color: #3e3871 !important;
                }
            `,
            tertiary: css`
                color: #6c5ce7 !important;
                &:hover {
                    color: #5d50be !important;
                }
                &:focus {
                    box-shadow: 0px 0px 0px 2px #ada4f4 !important;
                }
            `,
            destructive: css`
                background-color: #a31b00 !important;
                color: #ffffff !important;
                &:hover {
                    background-color: #701300 !important;
                }
                &:focus {
                    box-shadow: 0px 0px 0px 2px #ada4f4 !important;
                }
            `,
        },
        "collab-button--size": {
            large: css`
                font-size: 1rem;
                min-height: 2.5rem;
                max-height: 2.5rem;
            `,
            regular: css`
                margin-top: -1px;
            `,
            small: css`
                font-size: 0.875rem;
                min-height: 2rem;
                max-height: 2rem;
                padding: 0.3125rem 1rem;
            `,
        },
        "collab-button--icon-allignment": {
            left: css`
                svg:first-child {
                    float: left;
                    margin-left: 0;
                    margin-right: 0.5rem;
                }
            `,
            right: css`
                svg:first-child {
                    float: right;
                    margin-left: 0.5rem;
                    margin-right: 0;
                }
            `,
            both: css`
                svg:first-child {
                    float: left;
                    margin-right: 0.5rem;
                    margin-left: 0;
                }
                svg:last-child {
                    float: right;
                    margin-left: 0.5rem;
                    margin-right: 0;
                }
            `,
        },
        "collab-button-group": css`
            display: flex;
            & > button {
                margin-right: 1rem;
                &:last-child {
                    margin-right: 0;
                }
            }
        `,
        "collab-skeletonTileSvgClass": css`
            & > g rect {
                animation: ${skeletonTileProgressSlide} 1.8s infinite;
            }
        `,
        "collab-thread-body-comment--loader": css`
            padding: 0.625rem;
        `,
        "collab-thread--wrapper": css`
            cursor: default;
            position: relative;
            padding: 0 !important;
            font-family: Inter;
            color: #475161;
            width: 20.75rem;
        `,
        "collab-thread--container": css`
            max-height: 23.125rem;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        `,
        "collab-thread-header--wrapper": css`
            height: 2.5rem;
            padding: 0.2rem 0.1rem 0rem 0.625rem;
        `,
        "collab-thread-header--container": css`
            justify-content: space-between;
            width: 100%;
        `,
        "collab-thread-header--title": css`
            font-weight: 600;
            font-size: 0.875rem;
        `,
        "collab-thread-header--resolve": css`
            border-radius: 6px !important;
        `,
        "collab-thread-header--resolve--icon": css`
            width: 1.25rem;
            height: 1.25rem;
            margin-right: 0.5rem !important;
        `,
        "collab-thread-header--resolve--text": css`
            font-size: 0.875rem;
        `,
        "collab-thread-footer--wrapper": css`
            height: 3.5rem;
            width: 100%;
            flex-direction: row-reverse;
            padding: 0 0.9375rem;
            flex-shrink: 0;
        `,
        "collab-thread-body--wrapper": css`
            border: solid #edf1f7;
            border-width: 0.0625rem 0;
            flex: 1;
            overflow: auto;
            display: flex;
            flex-direction: column;
        `,
        "collab-thread-input-indicator--wrapper": css`
            padding: 0 0.5rem;
            font-weight: 400;
            font-size: 0.875rem;
            line-height: 150%;
            letter-spacing: 0.01em;
            min-height: 1.3125rem !important;
        `,
        "collab-thread-input-indicator--error": css`
            width: 100%;
            margin-right: 0.5rem;
            color: #d62400;
        `,
        "collab-thread-input-indicator--count": css`
            color: #475161;
        `,
        "collab-thread-comment--user-details": css`
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
        `,
        "collab-thread-comment--user-details__text": css`
            padding-left: 0.625rem;
            flex-grow: 1;
            min-width: 0;
        `,
        "collab-thread-comment--user-name": css`
            font-style: normal;
            font-weight: 600;
            font-size: 0.75rem;
            line-height: 150%;
            letter-spacing: 0.015rem;
            color: #475161;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `,
        "collab-thread-comment--list": css`
            max-height: 10.9rem;
            display: flex;
            overflow: auto;
            flex-flow: column-reverse;
        `,
        "collab-thread-comment-seperator": css`
            width: 100%;
            height: 1.5rem;
            stroke-width: 0.0625rem;
            stroke: #dde3ee;
        `,
        "collab-thread-comment--time-details": css`
            font-weight: 400;
            font-size: 0.75rem;
            line-height: 150%;
            font-style: Inter;
            letter-spacing: 0.015rem;
            color: #6e6b86;
        `,
        "collab-thread-comment--message": css`
            font-weight: 400;
            font-size: 1rem;
            line-height: 1.5rem;
            color: #475161;
            word-break: break-all;
            width: calc(100% - 10px);
            min-height: 2.25rem;
            white-space: pre-wrap;

            b {
                color: #6c5ce7;
                font-weight: 400;
            }
        `,
        "collab-thread-comment--wrapper": css`
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.625rem;
            padding: 0.625rem;
        `,
        "collab-thread-comment-action--wrapper": css`
            margin-left: auto;
            display: flex;
        `,
        "collab-thread-body--input--wrapper": css`
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
            grid-gap: 0.25rem;
        `,
        "collab-thread-body--input": css`
            position: relative;
            overflow-y: visible;
        `,
        "collab-thread-body--input--textarea--wrapper": css`
            width: 100%;
            transition: height 0.2s ease-in 0s;
        `,
        "collab-thread-body--input--textarea": css`
            display: block;
            width: 100%;
            position: relative;
            top: 0;
            left: 0;
            box-sizing: border-box;
            background-color: #ffffff;
            font-family: inherit;
            font-size: 1rem;
            letter-spacing: inherit;
            height: 100%;
            bottom: 0;
            overflow: auto;
            resize: vertical;
            border-radius: 4px;
            border: 0.0625rem solid #dde3ee;
            color: #222222;
            padding: 0.5rem 1rem;
            max-height: 6.25rem;
            min-height: 4.125rem;
            transition:
                border 0.2s ease,
                box-shadow 0.2s ease,
                background-color 0.2s ease;
        `,
        "collab-thread-body--input--textarea--focus": css`
            background-color: #ffffff !important;
            border: 0.0625rem solid #5d50be !important;
            box-shadow: 0 0 0 0.0625rem #5d50be !important;
            border-radius: 4px !important;
            outline: none;
        `,

        "collab-thread-body--input--textarea--hover": css`
            background-color: #edf1f7;
            border: 0.0625rem solid #5d50be !important;
            box-shadow: 0 0 0 0.0625rem #5d50be !important;
        `,
        "collab-thread-body--input--textarea--suggestionsList": css`
            list-style: none;
            padding-inline: unset;
            position: fixed;
            background-color: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow:
                0 4px 6px -1px rgba(0, 0, 0, 0.1),
                0 2px 4px -1px rgba(0, 0, 0, 0.06);
            max-height: 192px;
            overflow-y: auto;
            width: 256px;
            max-height: 160px;
            z-index: 50;
            animation: fadeIn 0.2s ease-in-out;

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(-4px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `,
        "collab-thread-body--input--textarea--suggestionsList--item": css`
            width: 100%;
            padding: 8px 16px;
            text-align: left;
            border: none;
            background: none;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;

            &:hover {
                background-color: #f3f4f6;
                color: #5d50be;
            }
        `,
        "collab-thread-body--input--textarea--suggestionsList--item-selected": css`
            background-color: #f3f4f6;
            color: #5d50be;
        `,
    };
}

export const flexCentered = css`
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const flexAlignCenter = css`
    display: flex;
    align-items: center;
`;
