import { FactoryObject } from "../../types/dash/Factory";
import { URLConfig } from "../../types/dash/Net";
declare class URLLoader {
    private config;
    private xhrLoader;
    private eventBus;
    constructor(ctx: FactoryObject, ...args: any[]);
    private _loadManifest;
    setup(): void;
    load(config: URLConfig): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<URLLoader>;
export default factory;
export { URLLoader };
