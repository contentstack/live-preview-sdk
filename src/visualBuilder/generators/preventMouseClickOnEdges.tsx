// Add this function at the top of your file or in a utilities file
export function hasEnoughSpaceForPopup(event: any, element: any) {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    console.log(viewportHeight);

    // Get mouse position
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    // console.log("Mouse X: ", mouseX);
    // console.log("Mouse Y: ", mouseY);

    // Define popup dimensions and offsets
    const popupHeight = 200; // Adjust based on your actual popup height
    const popupWidth = 334; // Adjust based on your actual popup width
    const topOffset = 100; // Your popupTopOffset value
    const leftOffset = 100; // Your popupLeftOffset value

    // Check if there's sufficient space in all directions
    const hasSpaceAbove = mouseY - topOffset - popupHeight > 0;
    const hasSpaceBelow = mouseY + popupHeight < viewportHeight;
    const hasSpaceLeft = mouseX - leftOffset - popupWidth / 2 > 0;
    const hasSpaceRight = mouseX + popupWidth / 2 < viewportWidth;

    // We need space either above OR below, AND either left AND right (for centering)

    console.log(hasSpaceAbove, hasSpaceBelow, hasSpaceLeft, hasSpaceRight);

    return (hasSpaceAbove || hasSpaceBelow) && hasSpaceLeft && hasSpaceRight;
}

export function isNearPageBottom(event: any) {
    // Get total scrollable height
    const scrollHeight = document.documentElement.scrollHeight;

    // Get current scroll position
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // Get viewport height
    const viewportHeight = window.innerHeight;

    // Get mouse position relative to viewport
    const mouseY = event.clientY;

    // Calculate distance from bottom of page
    const distanceFromBottom = scrollHeight - (scrollTop + viewportHeight);

    // Define the popup height
    const popupHeight = 200; // Adjust to your actual popup height

    // If we're near the bottom of the page AND the mouse is in the lower portion of the viewport
    return distanceFromBottom < popupHeight && mouseY > viewportHeight * 0.7;
}
