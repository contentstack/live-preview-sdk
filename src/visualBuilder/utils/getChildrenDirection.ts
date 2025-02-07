import getChildElements from "./getChildElements";


const validPositions = ["vertical", "horizontal", "none"] as const;
type ValidPositions = typeof validPositions[number];

export default function getChildrenDirection(
    editableElement: Element,
    parentCslpValue: string
): ValidPositions {
    if (!editableElement) {
        return "none";
    }

    const parentElement = editableElement.closest(
        `[data-cslp="${parentCslpValue}"]`
    );

    if (!parentElement) {
        return "none";
    }

    const directionFromParentElement =
        parentElement.getAttribute("data-add-direction");

    const isValidParentDirection = validPositions.includes(
        directionFromParentElement as ValidPositions
    );


    if (directionFromParentElement && isValidParentDirection) {
        return directionFromParentElement as ValidPositions;
    } else {
        const [firstChildElement, secondChildElement, removeClone] =
            getChildElements(parentElement, parentCslpValue);

        if (!firstChildElement) return "none";

        // get horizontal and vertical position differences
        const firstChildBounds = firstChildElement.getBoundingClientRect();
        const secondChildBounds = secondChildElement.getBoundingClientRect();

        const deltaX = Math.abs(firstChildBounds.left - secondChildBounds.left);
        const deltaY = Math.abs(firstChildBounds.top - secondChildBounds.top);

        const dir = deltaX > deltaY ? "horizontal" : "vertical";

        // remove the clone that was created in case there was only one child
        removeClone();

        return dir;
    }
}
