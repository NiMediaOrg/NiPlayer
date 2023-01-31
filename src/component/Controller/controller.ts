import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentConstructor, ComponentItem, DOMProps,Node, PlayerOptions } from "../../types/Player";
import { $ } from "../../utils/domUtils";
import { controllersMapping, storeControlComponent } from "../../utils/store";
import "./controller.less";
import { FullPage } from "./parts/FullPage";
import { FullScreen } from "./parts/FullScreen";
import { PicInPic } from "./parts/PicInPic";
import { PlayButton } from "./parts/PlayButton";
import { Playrate } from "./parts/Playrate";
import { ScreenShot } from "./parts/ScreenShot";
import { SubSetting } from "./parts/SubSetting";
import { Volume } from "./parts/Volume";
export class Controller extends Component implements ComponentItem {
  readonly id = "Controller";
  leftArea: HTMLElement; //代表着最左侧的区域
  mediumArea: HTMLElement;
  rightArea: HTMLElement; //代表最右侧的区域
  props: DOMProps = {};
  player: Player;
  // 控件
  leftControllers: ComponentConstructor[] = [PlayButton];
  rightController: ComponentConstructor[] = [Playrate,SubSetting,Volume,ScreenShot,PicInPic,FullPage,FullScreen];
  constructor(player: Player,container:HTMLElement, desc?:string, props?:DOMProps, children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initControllers()
    this.initTemplate();
    this.initComponent();

    storeControlComponent(this);
  }

  initControllers() {
    let leftControllers = (this.player.playerOptions as PlayerOptions).leftControllers;
    let rightControllers = (this.player.playerOptions as PlayerOptions).rightControllers;
    if(leftControllers) {
      this.leftControllers = leftControllers.map(item=>{
        if(typeof item === 'string') {
          if(!controllersMapping[item]) {
            throw new Error(`传入的组件名${item}错误`);
          }
          return controllersMapping[item];
        } else {
          return item;
        }
      })
    } 
    if(rightControllers) {
      this.rightController = rightControllers.map(item=>{
        if(typeof item === 'string') {
          if(!controllersMapping[item]) {
            throw new Error(`传入的组件名${item}错误`);
          }
          return controllersMapping[item];
        } else {
          return item;
        }
      })
    }
  }

  initTemplate() {
    this.leftArea = $("div.video-subplay");
    this.mediumArea = $("div.video-medium")
    this.rightArea = $("div.video-settings");
    this.el.appendChild(this.leftArea);
    this.el.appendChild(this.mediumArea);
    this.el.appendChild(this.rightArea);
  }

  initComponent() {
    this.leftControllers.forEach(ControlConstructor => {
      let instance = new ControlConstructor(this.player,this.leftArea,"div");
      this[instance.id] = instance;
    })

    this.rightController.forEach(ControlConstructor => {
      let instance = new ControlConstructor(this.player,this.rightArea,"div");
      this[instance.id] = instance;
    })
  }

  initEvent() {
    this.player.on("danmaku-plugin-add",()=>{
      
    })
  }
}
