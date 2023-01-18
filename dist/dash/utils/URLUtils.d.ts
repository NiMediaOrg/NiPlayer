import { FactoryFunction, FactoryObject } from "../../types/dash/Factory";
declare class URLUtils {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    resolve(...urls: string[]): string;
}
declare const factory: FactoryFunction<URLUtils>;
export default factory;
export { URLUtils };
