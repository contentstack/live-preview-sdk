import { computePosition, autoUpdate, offset } from "@floating-ui/dom";
import {
    DatePicker,
    DateTimePicker,
    DateTimePicker2,
    DateTimepicker2,
    TimePicker,
    TimePicker2,
} from "@contentstack/venus-components";
import { render } from "preact";
import { convertToISO8601UTC } from "../utils/convertToISO8601UTC";
import { format } from "date-fns";

export function generateDatePicker(
    editableElement: HTMLElement,
    fieldSchema: Record<string, any>,
    value: string,
    setValue: (value: string) => Promise<void>,
): ReturnType<typeof autoUpdate> {
    const startDate = fieldSchema.startDate;
    const endDate = fieldSchema.endDate;
    const hideTime = fieldSchema.fieldMetadata?.hideTime;

    const container = document.querySelector(".visual-editor__container");
    const datePickerContainer = document.createElement("div");
    datePickerContainer.style.position = "absolute";
    datePickerContainer.style.top = "0";
    datePickerContainer.style.left = "0";
    datePickerContainer.style.zIndex = "9999";
    datePickerContainer.style.backgroundColor = "#fff"

    container?.appendChild(datePickerContainer);


    const cleanupAutoUpdate = autoUpdate(editableElement, datePickerContainer, () =>
        computePosition(editableElement, datePickerContainer, {
            middleware: [offset(10)]
        }).then(({ x, y }) => {
            Object.assign(datePickerContainer.style, {
                left: `${x}px`,
                top: `${y}px`,
            });
        })
    );

    const cleanup = () => {
        datePickerContainer.remove();
        cleanupAutoUpdate();
    };
    render(
        <DateTimePicker2
            hideTime={hideTime}
            initialDate={value ? new Date(value) : ""}
            onDone={({ date, time }: { date: any; time: any }) => {
                setValue(parseDateFromDateTimePicker(date, time))
                cleanup();
            }}
            datePickerProps={{
                version: "v2",
                inputMaskProps: {
                    hasInputMask: false,
                },
                startDate,
                endDate,
                withCurrentDate: false,
                withFooter: false,
            }}
            timePickerProps={{
                version: "v2",
                withCurrentTime: false,
                shouldTimePickerModalOpen: true,
                onDone: () => { },
            }}
            version="v2"
        />,
        datePickerContainer
    );
    return cleanup;
}

function parseDateFromDateTimePicker(date: any, time: any) {
    let finalDate = "";
    if (typeof date === "object" && typeof time === "object") {
        finalDate = date.toISOString();
    }

    if (typeof date === "object" && typeof time === "string") {
        finalDate = convertToISO8601UTC(date.toISOString(), time);
    }

    if (typeof date === "string" && typeof time === "object") {
        //format time to "HH:mm:ssXX" format
        const formattedTime = format(time, "HH:mm:ssXX");
        finalDate = convertToISO8601UTC(date + "T" + "00:00:00.000Z", formattedTime);
    }

    if (typeof date === "string" && typeof time === "string") {
        finalDate = convertToISO8601UTC(date + "T" + "00:00:00.000Z", time);
    }
    return finalDate;
}
