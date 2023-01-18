import { FactoryObject } from "../../types/dash/Factory";
import { Path } from "../../types/dash/Location";
import { Mpd } from "../../types/dash/MpdFile";
import FactoryMaker from "../FactoryMaker";
class URLNode {
    url:string | null;
    children: URLNode[] = [];
    constructor(url:string | null) {
        this.url = url || null;
    }

    setChild(index:number,child:URLNode) {
        this.children[index] = child;
    }

    getChild(index:number): URLNode {
        return this.children[index];
    }
}

class BaseURLParser {
    private config: FactoryObject = {};
    constructor(ctx:FactoryObject,...args:any[]) {
        this.config = ctx.context;
        this.setup();
    }

    setup() {}

    parseManifestForBaseURL(manifest:Mpd):URLNode {
        let root = new URLNode(null);
        //1. 首先遍历每一个Period，规定BaseURL节点只可能出现在Period,AdaptationSet,Representation中
        manifest["Period_asArray"].forEach((p,pId)=>{
            let url = null;
            if(p["BaseURL_asArray"]) {
                url = p["BaseURL_asArray"][0];
            }
            let periodNode = new URLNode(url);
            root.setChild(pId,periodNode);
            p["AdaptationSet_asArray"].forEach((a,aId)=>{
                let url = null;
                if(a["BaseURL_asArray"]) {
                    url = a["BaseURL_asArray"][0];
                }
                let adaptationSetNode = new URLNode(url);
                periodNode.setChild(aId,adaptationSetNode);

                a["Representation_asArray"].forEach((r,rId)=>{
                    let url = null;
                    if(r["BaseURL_asArray"]) {
                        url = r["BaseURL_asArray"][0];
                    }
                    let representationNode = new URLNode(url);
                    adaptationSetNode.setChild(rId,representationNode);
                })
            })
        })
        return root;
    }

    getBaseURLByPath(path:Path, urlNode:URLNode): string {
        let baseURL = "";
        let root = urlNode;
        for(let i = 0;i<path.length;i++) {
            if(path[i] >= root.children.length || path[i] < 0) {
                throw new Error("传入的路径不正确");
            }
            if(root.children[path[i]].url) {
                baseURL += root.children[path[i]].url;
            }
            root = root.children[path[i]];
        }
        if(root.children.length > 0) {
            throw new Error("传入的路径不正确");
        }
        return baseURL;
    }
}
const factory = FactoryMaker.getSingleFactory(BaseURLParser);
export default factory;
export { BaseURLParser,URLNode};