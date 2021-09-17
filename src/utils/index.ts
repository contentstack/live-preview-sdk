export function bindEvent(
    element: HTMLElement | Window,
    eventName: keyof HTMLElementEventMap,
    eventHandler: (
        this: HTMLElement,
        ev: HTMLElementEventMap[typeof eventName]
    ) => any
) {
    if (element.addEventListener) {
        element.addEventListener(eventName, eventHandler, false);
    } else if ((<any>element).attachEvent) {
        (<any>element).attachEvent("on" + eventName, eventHandler);
    }
}

export function hasWindow() {
    return typeof window !== "undefined";
}

export const tooltipSingularInnerHtml = `<div class="singular edit-button">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>Edit
  </div>`;

export const tooltipMultipleInnerHtml = `<div class="edit-button" title="edit">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>
  </div>
  <div title="click element" class="external-link-button">
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.66654 2.66758H13.3332V13.3342H6.66654V16.0009H13.3332C14.0405 16.0009 14.7187 15.72 15.2188 15.2199C15.7189 14.7198 15.9999 14.0415 15.9999 13.3342V2.66758C15.9999 1.96034 15.7189 1.28206 15.2188 0.781964C14.7187 0.281867 14.0405 0.000915527 13.3332 0.000915527H2.66654C1.9593 0.000915527 1.28102 0.281867 0.780927 0.781964C0.280829 1.28206 -0.00012207 1.96034 -0.00012207 2.66758V9.33425H2.66654V2.66758Z" fill="#718096" />
      <path d="M6.94263 7.05734L0.999958 13L2.88529 14.8853L8.82796 8.94267L10.8853 11V5.00001H4.88529L6.94263 7.05734Z" fill="#718096" />
    </svg>
  </div>`;

export const createSingularEditButton = (
    editCallback: (e: MouseEvent) => void
) => {
    const singularEditButton = document.createElement("div");
    singularEditButton.classList.add("cslp-tooltip-child", "singular");
    singularEditButton.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>Edit`;

    singularEditButton.addEventListener("click", editCallback);

    return singularEditButton;
};

export const createMultipleEditButton = (
    editCallback: (e: MouseEvent) => void,
    linkCallback: (e: MouseEvent) => void
) => {
    const multipleEditButton = document.createElement("div");
    multipleEditButton.classList.add("cslp-tooltip-child");
    multipleEditButton.setAttribute("data-title", "Edit");
    multipleEditButton.innerHTML = ` <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8.1 3.5L0.3 11.3C0.1 11.5 0 11.7 0 12V15C0 15.6 0.4 16 1 16H4C4.3 16 4.5 15.9 4.7 15.7L12.5 7.9L8.1 3.5Z" fill="#718096"></path>
      <path d="M15.7 3.3L12.7 0.3C12.3 -0.1 11.7 -0.1 11.3 0.3L9.5 2.1L13.9 6.5L15.7 4.7C16.1 4.3 16.1 3.7 15.7 3.3Z" fill="#718096"></path>
    </svg>`;

    multipleEditButton.addEventListener("click", editCallback);

    const multipleExternalLinkButton = document.createElement("div");
    multipleExternalLinkButton.classList.add("cslp-tooltip-child");
    multipleExternalLinkButton.setAttribute("data-title", "Go to link");
    multipleExternalLinkButton.innerHTML = ` <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.66654 2.66758H13.3332V13.3342H6.66654V16.0009H13.3332C14.0405 16.0009 14.7187 15.72 15.2188 15.2199C15.7189 14.7198 15.9999 14.0415 15.9999 13.3342V2.66758C15.9999 1.96034 15.7189 1.28206 15.2188 0.781964C14.7187 0.281867 14.0405 0.000915527 13.3332 0.000915527H2.66654C1.9593 0.000915527 1.28102 0.281867 0.780927 0.781964C0.280829 1.28206 -0.00012207 1.96034 -0.00012207 2.66758V9.33425H2.66654V2.66758Z" fill="#718096" />
      <path d="M6.94263 7.05734L0.999958 13L2.88529 14.8853L8.82796 8.94267L10.8853 11V5.00001H4.88529L6.94263 7.05734Z" fill="#718096" />
    </svg>`;

    multipleExternalLinkButton.addEventListener("click", linkCallback);

    const multipleEditFragment = document.createDocumentFragment();
    multipleEditFragment.appendChild(multipleEditButton);
    multipleEditFragment.appendChild(multipleExternalLinkButton);

    const multipleDiv = document.createElement("div");
    multipleDiv.appendChild(multipleEditFragment);
    multipleDiv.classList.add("multiple");

    return multipleDiv;
};
