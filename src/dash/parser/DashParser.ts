import { DOMNodeTypes, ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import { AdaptationSet, Mpd, Period, SegmentTemplate } from "../../types/dash/MpdFile";
import SegmentTemplateParserFactory,{SegmentTemplateParser} from "./SegmentTemplateParser";
import FactoryMaker from "../FactoryMaker";
import { parseDuration, switchToSeconds } from "../../utils/format";
import { checkMpd, checkPeriod } from "../../utils/typeCheck";
class DashParser {
  private config: FactoryObject = {};
  private segmentTemplateParser:SegmentTemplateParser;

  constructor(ctx: FactoryObject, ...args: any[]) {
    this.config = ctx.context;
    this.setup();
  }

  setup() {
    this.segmentTemplateParser = SegmentTemplateParserFactory().getInstance();
  }

  string2xml(s: string): Document {
    let parser = new DOMParser();
    return parser.parseFromString(s, "text/xml");
  }

  // 解析请求到的xml类型的文本字符串，生成MPD对象,方便后续的解析
  parse(manifest: string): ManifestObjectNode["MpdDocument"] | ManifestObjectNode["Mpd"] {
    let xml = this.string2xml(manifest);
    let Mpd;
    if(this.config.override) {
      Mpd = this.parseDOMChildren("Mpd", xml);
    } else {
      Mpd = this.parseDOMChildren("MpdDocument",xml);
    }
    
    this.mergeNodeSegementTemplate(Mpd);
    this.segmentTemplateParser.parse(Mpd);
    console.log(Mpd);
    return Mpd;
  }

  parseDOMChildren<T extends string>(name:T,node: Node): ManifestObjectNode[T] {
    //如果node的类型为文档类型
    if (node.nodeType === DOMNodeTypes.DOCUMENT_NODE) {
      let result = {
        tag: node.nodeName,
        __children: [],
      };
      // 文档类型的节点一定只有一个子节点
      for (let index in node.childNodes) {
        if(node.childNodes[index].nodeType === DOMNodeTypes.ELEMENT_NODE) {
          // 如果在配置指定需要忽略根节点的话，也就是忽略MpdDocument节点
          if(!this.config.ignoreRoot) {
            result.__children[index] = this.parseDOMChildren(
              node.childNodes[index].nodeName,node.childNodes[index]
            );
            result[node.childNodes[index].nodeName] = this.parseDOMChildren(
              node.childNodes[index].nodeName,node.childNodes[index]
            );
          } else {
            return this.parseDOMChildren(node.childNodes[index].nodeName,node.childNodes[index]);
          }
        }
      }
      return result;
    } else if (node.nodeType === DOMNodeTypes.ELEMENT_NODE) {
      let result: FactoryObject = {
        tag: node.nodeName,
        __chilren: [],
      };
      // 1.解析node的子节点
      for (let index = 0; index<node.childNodes.length; index++) {
        let child = node.childNodes[index];
        result.__chilren[index] = this.parseDOMChildren(child.nodeName,child);
        if (!result[child.nodeName]) {
          result[child.nodeName] = this.parseDOMChildren(child.nodeName,child);
          continue;
        }
        if (result[child.nodeName] && !Array.isArray(result[child.nodeName])) {
          result[child.nodeName] = [result[child.nodeName]];
        }
        if (result[child.nodeName]) {
          result[child.nodeName].push(this.parseDOMChildren(child.nodeName,child));
        }
      }
      // 2. 将node中的具有多个相同标签的子标签合并为一个数组
      for (let key in result) {
        if (key !== "tag" && key !== "__children") {
          result[key + "_asArray"] = Array.isArray(result[key])
            ? [...result[key]]
            : [result[key]];
        }
      }
      // 3.如果该Element节点中含有text节点，则需要合并为一个整体
      result["#text_asArray"] && result["#text_asArray"].forEach(text=>{
        result.__text = result.__text || "";
        result.__text += `${text.text}/n`
      })
      // 4.解析node上挂载的属性
      for (let prop of (node as Element).attributes) {
        result[prop.name] = prop.value;
      }
      
      return result;
    } else if (node.nodeType === DOMNodeTypes.TEXT_NODE) {
      return {
        tag: "#text",
        text: node.nodeValue
      }
    }
  }

  mergeNode(node:FactoryObject,compare:FactoryObject) {
    if(node[compare.tag]) {
      let target = node[`${compare.tag}_asArray`];
      target.forEach(element => {
        for(let key in compare) {
          if(!element.hasOwnProperty(key)) {
            element[key] = compare[key];
          }
        }
      });

    } else {
      node[compare.tag] = compare;
      node.__children = node.__children || [];
      node.__children.push(compare);
      node[`${compare.tag}__asArray`] = [compare];
    }
  }

  mergeNodeSegementTemplate(Mpd:Mpd) {
    let segmentTemplate: SegmentTemplate | null = null;
    Mpd["Period_asArray"].forEach(Period=>{
      if(Period["SegmentTemplate_asArray"]) {
        segmentTemplate = Period["SegmentTemplate_asArray"][0];
      }
      Period["AdaptationSet_asArray"].forEach(AdaptationSet=>{
        let template = segmentTemplate;
        if(segmentTemplate) {
          this.mergeNode(AdaptationSet,segmentTemplate);
        }
        if(AdaptationSet["SegmentTemplate_asArray"]) {
          segmentTemplate = AdaptationSet["SegmentTemplate_asArray"][0];
        }
        AdaptationSet["Representation_asArray"].forEach(Representation=>{
          if(segmentTemplate) {
            this.mergeNode(Representation,segmentTemplate);
          }
        })
        segmentTemplate = template;
      })
    })
  }

  static getTotalDuration(Mpd:Mpd): number | never {
    let totalDuration = 0;
    let MpdDuration = NaN;
    if(Mpd.mediaPresentationDuration) {
      MpdDuration = switchToSeconds(parseDuration(Mpd.mediaPresentationDuration));
    }
    // MPD文件的总时间要么是由Mpd标签上的availabilityStartTime指定，要么是每一个Period上的duration之和
    if(isNaN(MpdDuration)) {
      Mpd.forEach(Period=>{
        if(Period.duration) {
          totalDuration += switchToSeconds(parseDuration(Period.duration));
        } else {
          throw new Error("MPD文件格式错误")
        }
      })
    } else {
      totalDuration = MpdDuration;
    }
    return totalDuration;
  }

  // 给每一个Representation对象上挂载duration属性
  static setDurationForRepresentation(Mpd: Mpd | Period | AdaptationSet) {
    if(checkMpd(Mpd)) {
      //1. 如果只有一个Period
      if(Mpd["Period_asArray"].length === 1) {
        let totalDuration = DashParser.getTotalDuration(Mpd);
        Mpd["Period_asArray"].forEach(Period=>{
          Period.duration = Period.duration || totalDuration;
          Period["AdaptationSet_asArray"].forEach(AdaptationSet=>{
            AdaptationSet.duration = totalDuration;
            AdaptationSet["Representation_asArray"].forEach(Representation=>{
              Representation.duration = totalDuration;
            })
          })
        })
      } else {
        Mpd["Period_asArray"].forEach(Period=>{
          if(!Period.duration) {
            throw new Error("MPD文件格式错误");
          }
          let duration = Period.duration;
          Period["AdaptationSet_asArray"].forEach(AdaptationSet=>{
            AdaptationSet.duration = duration;
            AdaptationSet["Representation_asArray"].forEach(Representation=>{
              Representation.duration = duration;
            })
          })
        })
      }
    } else if(checkPeriod(Mpd)) {
      //ToDo

    }
  }
}

const factory = FactoryMaker.getSingleFactory(DashParser);
export default factory;
export {DashParser};