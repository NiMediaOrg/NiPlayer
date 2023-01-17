import { FactoryObject } from "../types/dash/Factory";
/**
 * @description 整个dash处理流程的入口类MediaPlayer
 */
declare class MediaPlayer {
    private config;
    private urlLoader;
    private eventBus;
    private dashParser;
    private baseURLParser;
    private baseURLPath;
    constructor(ctx: FactoryObject, ...args: any[]);
    setup(): void;
    initializeEvent(): void;
    resetEvent(): void;
    onManifestLoaded(data: string): void;
    /**
     * @description 发送MPD文件的网络请求，我要做的事情很纯粹，具体实现细节由各个Loader去具体实现
     * @param url
     */
    attachSource(url: string): void;
}
declare const factory: import("../types/dash/Factory").FactoryFunction<MediaPlayer>;
export default factory;
