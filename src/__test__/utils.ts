export function convertObjectToMinifiedString(
    obj: { [key: string]: any } | string
): any {
    let stringObj = obj;
    if (typeof obj !== "string") {
        stringObj = JSON.stringify(obj);
    }
    return stringObj.replace(/([\n]+|[\s]{2,})/gm, " ");
}

export async function sendPostmessageToWindow(
    type: string,
    data: { [key: string]: any },
    targetOrigin = "*",
    timeout = 10
): Promise<void> {
    window.postMessage(
        {
            type,
            data,
            from: "live-preview",
        },
        targetOrigin
    );

    return new Promise<void>((res) => setTimeout(res, timeout));
}
