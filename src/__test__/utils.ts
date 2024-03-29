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

export class DOMRect {
    top = 76.75;
    right = 1587;
    bottom = 109.75;
    left = 58;
    constructor(
        public x = 5,
        public y = 0,
        public width = 0,
        public height = 0
    ) {}
    static fromRect(other?: DOMRectInit): DOMRect {
        return new DOMRect(other?.x, other?.y, other?.width, other?.height);
    }
    toJSON() {
        return JSON.stringify(this);
    }
}
