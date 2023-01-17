import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period, Representation, SegmentTemplate } from "../../types/dash/MpdFile";
/**
 * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况
 */
declare class SegmentTemplateParser {
    private config;
    private dashParser;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    parse(Mpd: Mpd | Period | AdaptationSet): void;
    setSegmentDurationForRepresentation(Mpd: Mpd): void;
    parseNodeSegmentTemplate(Mpd: Mpd): void;
    generateInitializationURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
    generateMediaURL(SegmentTemplate: SegmentTemplate, parent: Representation): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<SegmentTemplateParser>;
export default factory;
export { SegmentTemplateParser };
