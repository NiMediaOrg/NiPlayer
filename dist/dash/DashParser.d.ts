import { ManifestObjectNode } from "../types/dash/DomNodeTypes";
import { FactoryObject } from "../types/dash/Factory";
declare class DashParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["Document"] | ManifestObjectNode["Mpd"];
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
}
declare const factory: import("../types/dash/Factory").FactoryFunction<DashParser>;
export default factory;
export { DashParser };
