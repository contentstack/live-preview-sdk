import { addCslpOutline } from "../../../cslp";

function handleMouseOver(event: MouseEvent) {
    console.log("[IN SDK] : in handleMouseOver");
    addCslpOutline(event);
}

export default handleMouseOver;