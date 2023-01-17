import { FactoryObject } from "../../types/dash/Factory";
import { Representation, SegmentTemplate } from "../../types/dash/MpdFile";
import FactoryMaker from "../FactoryMaker";

class SegmentTemplateParser {
    private config: FactoryObject;
    private templateReg:RegExp = /\$(.+)?\$/;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup(){}

    parseNodeSegmentTemplate(Mpd:FactoryObject) {
        Mpd["Period_asArray"].forEach(Period=>{
          Period["AdaptationSet_asArray"].forEach(AdaptationSet=>{
            AdaptationSet["Representation_asArray"].forEach(Representation=>{
              let SegmentTemplate = Representation["SegmentTemplate"];
              this.generateInitializationURL(SegmentTemplate,Representation);
              this.generateMediaURL(SegmentTemplate,Representation);
            })
          })
        })
      }
    
    generateInitializationURL(SegmentTemplate:SegmentTemplate,parent:Representation) {
        let initialization = SegmentTemplate.initialization;
        let media = SegmentTemplate.media;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        if(this.templateReg.test(initialization)) {
          while(r = this.templateReg.exec(initialization)) {
            formatArray.push(r[0]);
            if(r[1] === "Number") {
              r[1] = "1";
            } else if(r[1] === "RepresentationID") {
              r[1] = parent.id!;
            }
            replaceArray.push(r[1]);
          }
    
          let index = 0;
          while(index < replaceArray.length) {
            initialization.replace(formatArray[index],replaceArray[index]);
            index++;
          }
        }
        parent.initializationURL = initialization;
    }
    
    generateMediaURL(SegmentTemplate:SegmentTemplate,parent:Representation) {
        let meida = SegmentTemplate.media;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        
    }
}

const factory = FactoryMaker.getSingleFactory(SegmentTemplateParser);
export default factory;
export {SegmentTemplateParser};

