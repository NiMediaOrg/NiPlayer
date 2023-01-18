import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class MediaPlayerController {
    private config:FactoryObject = {}
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }
    setup(){}
}

const factory = FactoryMaker.getClassFactory(MediaPlayerController);
export default factory;
export { MediaPlayerController };