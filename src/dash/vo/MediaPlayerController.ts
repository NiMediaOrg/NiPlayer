import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class MediaPlayerController {
    private config:FactoryObject = {};
    private video: HTMLVideoElement;
    private mediaSource: MediaSource;
    private sourceBuffers: SourceBuffer[];
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }
    setup(){
        this.mediaSource = new MediaSource();
    }
}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };