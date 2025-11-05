import { render } from "preact";
import { PopupBlockedModal } from "./PopupBlockedModal";

class PopupBlockedModalManager {
    private container: HTMLDivElement | null = null;
    private isOpen = false;

    private ensureContainer(): HTMLDivElement {
        if (!this.container) {
            this.container = document.createElement("div");
            this.container.id = "popup-blocked-modal-container";
            document.body.appendChild(this.container);
        }
        return this.container;
    }

    show(): void {
        this.isOpen = true;
        this.render();
    }

    hide(): void {
        this.isOpen = false;
        this.render();
    }

    private render(): void {
        const container = this.ensureContainer();
        render(
            <PopupBlockedModal
                isOpen={this.isOpen}
                onClose={() => this.hide()}
            />,
            container
        );
    }

    destroy(): void {
        if (this.container) {
            render(null, this.container);
            this.container.remove();
            this.container = null;
        }
    }
}

export const popupBlockedModalManager = new PopupBlockedModalManager();
