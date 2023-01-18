import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period, Representation, SegmentTemplate } from "../../types/dash/MpdFile";
import { parseDuration, switchToSeconds } from "../../utils/format";
import FactoryMaker from "../FactoryMaker";
import { DashParser } from "./DashParser";
/**
 * @description 该类仅用于处理MPD文件中具有SegmentTemplate此种情况
 */
class SegmentTemplateParser { 
    private config: FactoryObject;
    private dashParser: DashParser;
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup(){
        
    }

    parse(Mpd: Mpd | Period | AdaptationSet) {
        DashParser.setDurationForRepresentation(Mpd);
        this.setSegmentDurationForRepresentation(Mpd as Mpd);
        this.parseNodeSegmentTemplate(Mpd as Mpd);
    } 

    setSegmentDurationForRepresentation(Mpd:Mpd) {
        let maxSegmentDuration = switchToSeconds(parseDuration(Mpd.maxSegmentDuration));
        Mpd["Period_asArray"].forEach(Period => {
            Period["AdaptationSet_asArray"].forEach(AdaptationSet => {
              AdaptationSet["Representation_asArray"].forEach(Representation => {
                if(Representation["SegmentTemplate"]) {
                    if((Representation["SegmentTemplate"] as SegmentTemplate).duration) {
                        let duration = (Representation["SegmentTemplate"] as SegmentTemplate).duration
                        let timescale = (Representation["SegmentTemplate"] as SegmentTemplate).timescale || 1;
                        Representation.segmentDuration = (duration / timescale).toFixed(1);
                    } else {
                        if(maxSegmentDuration) {
                            Representation.segmentDuration = maxSegmentDuration;
                        } else {
                            throw new Error("MPD文件格式错误")
                        }
                    }
                }
              })
            })
          })
    }

    parseNodeSegmentTemplate(Mpd:Mpd) {
        Mpd["Period_asArray"].forEach(Period=>{
          Period["AdaptationSet_asArray"].forEach(AdaptationSet=>{
            AdaptationSet["Representation_asArray"].forEach(Representation=>{
              let SegmentTemplate = Representation["SegmentTemplate"];
              if(SegmentTemplate) {
                this.generateInitializationURL(SegmentTemplate,Representation);
                this.generateMediaURL(SegmentTemplate,Representation);
              }
            })
          })
        })
    }
    
    generateInitializationURL(SegmentTemplate:SegmentTemplate,parent:Representation) {
        let templateReg:RegExp = /\$(.+?)\$/ig;
        let initialization = SegmentTemplate.initialization;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        if(templateReg.test(initialization)) {
          templateReg.lastIndex = 0;
          while(r = templateReg.exec(initialization)) {
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
            initialization = initialization.replace(formatArray[index],replaceArray[index]);
            index++;
          }
        }
        parent.initializationURL = initialization;
    }
    
    generateMediaURL(SegmentTemplate:SegmentTemplate,parent:Representation) {
        let templateReg:RegExp = /\$(.+?)\$/ig;
        let media = SegmentTemplate.media;
        let r;
        let formatArray = new Array<string>();
        let replaceArray = new Array<string>();
        parent.mediaURL = new Array<string>();
        if(templateReg.test(media)) {
            templateReg.lastIndex = 0;
            while(r = templateReg.exec(media)) {
                formatArray.push(r[0]);
                if(r[1] === "Number") {
                    r[1] = "@Number@";
                } else if(r[1] === "RepresentationID") {
                    r[1] = parent.id;
                }
                replaceArray.push(r[1]);
            }
        }
        
        let index = 0;
        while(index < replaceArray.length) {
            media = media.replace(formatArray[index],replaceArray[index]);
            index++;
        }
        for(let i = 1;i <= Math.ceil(parent.duration / parent.segmentDuration); i++) {
            let s = media;
            while(s.includes("@Number@")) {
                s = s.replace("@Number@",`${i}`);
            }
            parent.mediaURL[i] = s;
        }
    }
}

const factory = FactoryMaker.getSingleFactory(SegmentTemplateParser);
export default factory;
export {SegmentTemplateParser};

