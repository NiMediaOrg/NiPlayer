import { FactoryObject } from "../../types/dash/Factory";
declare class SegmentTemplateParser {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<SegmentTemplateParser>;
export default factory;
export { SegmentTemplateParser };
