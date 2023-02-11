import { Component } from "../../../class/Component";
import { Player } from "../../../page/player";
import { ComponentConstructor, ComponentItem, DOMProps,Node } from "../../../types/Player";
import { $ } from "../../../utils/domUtils";
import { controllersMapping, storeControlComponent } from "../../../utils/store";
import { DutaionShow } from "./parts/DurationShow";
import { FullPage } from "./parts/FullPage";
import { FullScreen } from "./parts/FullScreen";
import { PicInPic } from "./parts/PicInPic";
import { PlayButton } from "./parts/PlayButton";
import { Playrate } from "./parts/Playrate";
import { ScreenShot } from "./parts/ScreenShot";
import { SubSetting } from "./parts/SubSetting";
import { VideoShot } from "./parts/VideoShot";
import { Volume } from "./parts/Volume";
export class Controller extends Component implements ComponentItem {
  readonly id = "Controller";
  leftArea: HTMLElement; //代表着最左侧的区域
  mediumArea: HTMLElement;
  rightArea: HTMLElement; //代表最右侧的区域
  player: Player;
  // 控件
  leftControllers: ComponentConstructor[] = [PlayButton,Volume, DutaionShow];
  rightController: ComponentConstructor[] = [Playrate,SubSetting,VideoShot,ScreenShot,PicInPic,FullPage,FullScreen];
  constructor(player: Player,container:HTMLElement,desc?:string) {
    super(container,desc);
    this.player = player;
    this.init();
  }

  init() {
    this.initControllers()
    this.initTemplate();
    this.initComponent();

    storeControlComponent(this);
  }

  initControllers() {
    let leftControllers = this.player.playerOptions.leftBottomBarControllers || null;
    let rightControllers = this.player.playerOptions.rightBottomBarControllers || null;
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
    this.leftArea = $("div.video-bottombar-left");
    this.mediumArea = $("div.video-bottombar-medium")
    this.rightArea = $("div.video-bottombar-right");
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
}
