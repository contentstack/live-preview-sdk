export function convertObjectToMinifiedString(
    obj: { [key: string]: any } | string
): any {
    let stringObj = obj;
    if (typeof obj !== "string") {
        stringObj = JSON.stringify(obj);
    }
    return stringObj.replace(/([\n]+|[\s]{2,})/gm, " ");
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
    toJSON(): string {
        return JSON.stringify(this);
    }
}

export async function sleep(waitTimeInMs = 100): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, waitTimeInMs));
}
