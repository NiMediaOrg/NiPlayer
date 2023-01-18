import { FactoryObject } from "../../types/dash/Factory";
import { PlayerBuffer } from "../../types/dash/Net";
declare class MediaPlayerBuffer {
    private config;
    private arrayBuffer;
    constructor(ctx: FactoryObject, ...args: any[]);
    push(buffer: PlayerBuffer): void;
    clear(): void;
    isEmpty(): boolean;
    delete(buffer: PlayerBuffer): void;
    top(): PlayerBuffer;
    pop(): void;
}
declare const factory: import("../../types/dash/Factory").FactoryFunction<MediaPlayerBuffer>;
export default factory;
export { MediaPlayerBuffer };
