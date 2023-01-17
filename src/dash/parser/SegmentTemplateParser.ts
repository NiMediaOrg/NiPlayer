import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";

class SegmentTemplateParser {
    private config: FactoryObject;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup(){}


}

const factory = FactoryMaker.getSingleFactory(SegmentTemplateParser);
export default factory;
export {SegmentTemplateParser};

