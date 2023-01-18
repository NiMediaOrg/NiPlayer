import { FactoryObject } from "../../types/dash/Factory";
declare class MediaPlayerController {
    private config;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<MediaPlayerController>;
export default factory;
export { MediaPlayerController };
