import { FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
declare class URLNode {
    private url;
    private children;
    constructor(url: string | null);
    setChild(index: number, child: URLNode): void;
    getChild(index: number): URLNode;
}
declare class BaseURLParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    parseManifestForBaseURL(manifest: Mpd): URLNode;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<BaseURLParser>;
export default factory;
