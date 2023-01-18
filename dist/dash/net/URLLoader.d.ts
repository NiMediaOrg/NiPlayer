import { FactoryObject } from "../../types/dash/Factory";
import { RequestType, URLConfig } from "../../types/dash/Net";
declare class URLLoader {
    private config;
    private xhrLoader;
    private eventBus;
    constructor(ctx: FactoryObject, ...args: any[]);
    private _loadManifest;
    private _loadSegment;
    setup(): void;
    load(config: URLConfig, type: RequestType): Promise<any> | void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<URLLoader>;
export default factory;
export { URLLoader };
