import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
import { XHRConfig } from "../../types/dash/Net";
declare class XHRLoader {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    loadManifest(config: XHRConfig): void;
}
declare const factory: FactoryFunction<XHRLoader>;
export default factory;
export { XHRLoader };
