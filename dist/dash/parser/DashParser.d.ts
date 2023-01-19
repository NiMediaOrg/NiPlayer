import { ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { Mpd } from "../../types/dash/MpdFile";
declare class DashParser {
    private config;
    private segmentTemplateParser;
    private eventBus;
    private mpdURL;
    private URLUtils;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initialEvent(): void;
    string2xml(s: string): Document;
    parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"];
    parseDOMChildren<T extends string>(name: T, node: Node): ManifestObjectNode[T];
    mergeNode(node: FactoryObject, compare: FactoryObject): void;
    mergeNodeSegementTemplate(Mpd: Mpd): void;
    setBaseURLForMpd(Mpd: Mpd): void;
    setResolvePowerForRepresentation(Mpd: Mpd): void;
    getSegmentDuration(Mpd: Mpd, streamId: number): number | never;
    getTotalDuration(Mpd: Mpd): number | never;
    setDurationForRepresentation(Mpd: Mpd): void;
    setSegmentDurationForRepresentation(Mpd: Mpd): void;
    onSourceAttached(url: string): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<DashParser>;
export default factory;
export { DashParser };
