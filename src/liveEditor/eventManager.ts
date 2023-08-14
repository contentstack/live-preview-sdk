import { send, on } from "post-robot";

type MessageHandler = (payload?: any) => Promise<any>;
interface IRegisterEventOptions {
    preHandler?: MessageHandler[];
    postHandler?: MessageHandler[];
}
export class EventManager {
    private messageHandlers: { [key: string]: MessageHandler };
    private preMessageHandlers: { [key: string]: MessageHandler[] };
    private postMessageHandlers: { [key: string]: MessageHandler[] };
    private channelID: string;
    private targetWindow: Window;

    constructor(channelID: string, targetWindow: Window) {
        this.targetWindow = targetWindow;
        this.channelID = channelID;
        this.messageHandlers = {};
        this.preMessageHandlers = {};
        this.postMessageHandlers = {};
        // on(this.channelID, { window: this.targetWindow }, (event) => {
        //     const { type, payload } = event.data;
        //     return this.handleMessage(type, payload);
        // });
    }

    public async triggerEvent(type: string, payload?: any): Promise<any> {
        const message = { type, payload };
        return send(this.targetWindow, this.channelID, message);
    }

    public registerEvent(
        type: string,
        handler: MessageHandler,
        options?: IRegisterEventOptions
    ): void {
        if (options?.preHandler && Array.isArray(options.preHandler)) {
            this.preMessageHandlers[type] = options?.preHandler;
        }
        this.messageHandlers[type] = handler;
        if (options?.postHandler && Array.isArray(options.postHandler)) {
            this.postMessageHandlers[type] = options?.postHandler;
        }
    }

    public unRegisterEvent(type: string): void {
        delete this.preMessageHandlers[type];
        delete this.messageHandlers[type];
        delete this.postMessageHandlers[type];
    }

    private async handleMessage(type: string, payload?: any): Promise<any> {
        const handler = this.messageHandlers[type];
        if (handler) {
            const preHandlers = this.preMessageHandlers[type] || [];
            for (const preHandler of preHandlers) {
                await preHandler(payload);
            }

            const eventResponse = await handler(payload);

            const postHandlers = this.postMessageHandlers[type] || [];
            for (const postHandler of postHandlers) {
                await postHandler(payload);
            }
            return eventResponse;
        } else {
            // TODO: To check whether to throw error
            console.warn("No handler found for: ", type);
            return Promise.resolve();
        }
    }
}
class EventManagerSingleton {
    static instances: { [key: string]: EventManager } = {};

    static getInstance(channelID: string, targetWindow: Window): EventManager {
        if (!EventManagerSingleton.instances[channelID]) {
            EventManagerSingleton.instances[channelID] = new EventManager(
                channelID,
                targetWindow
            );
        }
        return EventManagerSingleton.instances[channelID];
    }
}
export default EventManagerSingleton;
