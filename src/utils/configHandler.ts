import { IConfig, IInitData } from "../types/types";
import { getDefaultConfig, getUserInitData } from "./defaults";
import { handleInitData } from "./handleUserConfig";
import { has as lodashHas, set as lodashSet } from "lodash";

class Config {
    static config: IConfig = getDefaultConfig();

    static replace(userInput: Partial<IInitData> = getUserInitData()): void {
        handleInitData(userInput, this.config);
    }

    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    static set(key: string, value: any): void {
        if (!lodashHas(this.config, key)) {
            throw new Error(`Invalid key: ${key}`);
        }
        lodashSet(this.config, key, value);
    }

    static get(): IConfig {
        return this.config;
    }

    static reset(): void {
        this.config = getDefaultConfig();
    }
}

export default Config;
