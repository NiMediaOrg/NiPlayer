import { DOMNodeTypes, ManifestObjectNode } from "../../types/dash/DomNodeTypes";
import { FactoryObject } from "../../types/dash/Factory";
import FactoryMaker from "../FactoryMaker";
class DashParser {
  private config: FactoryObject = {};
  constructor(ctx: FactoryObject, ...args: any[]) {
    this.config = ctx.context;
  }

  string2xml(s: string): Document {
    let parser = new DOMParser();
    return parser.parseFromString(s, "text/xml");
  }

  parse(manifest: string): ManifestObjectNode["Document"] | ManifestObjectNode["Mpd"] {
    let xml = this.string2xml(manifest);

    return this.parseDOMChildren("Document", xml);
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
      let result = {
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
      for (let key in result) {
        if (key !== "tag" && key !== "__children") {
          result[key + "_asArray"] = Array.isArray(result[key])
            ? [...result[key]]
            : [result[key]];
        }
      }
      // 2.解析node上挂载的属性
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
}

const factory = FactoryMaker.getSingleFactory(DashParser);
export default factory;
export {DashParser};