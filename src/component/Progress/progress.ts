import { Node } from "../../types/Player";
import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps } from "../../types/Player";
import { Dot } from "./parts/Dot";
import { CompletedProgress } from "./parts/CompletedProgress";
import { BufferedProgress } from "./parts/BufferedProgress";
import "./progress.less"
import { storeControlComponent } from "../../utils/store";

export class Progress extends Component implements ComponentItem {
  readonly id = "Progress";
  props: DOMProps;
  player:Player;
  dot: Dot;
  completedProgress: CompletedProgress;
  bufferedProgress: BufferedProgress;
  constructor(player:Player,container:HTMLElement,desc?:string,props?:DOMProps,children?:Node[]) {
    super(container,desc,props,children);
    this.player = player;
    this.props = props || {};
    this.init();
  }

  init() {
    this.initComponent();
    this.initEvent();

    storeControlComponent(this);
  }

  initComponent() {
    this.dot = new Dot(this.player,this.el,"div");
    this.completedProgress = new CompletedProgress(this.player,this.el,"div.video-completed");
    this.bufferedProgress = new BufferedProgress(this.player,this.el,"div.video-buffered");
  }

  initEvent() {
    this.el.onmouseenter = (e) => {
      this.onMouseenter(e);
    }

    this.el.onmouseleave = (e) => {
      this.onMouseleave(e);
    }

    this.el.onclick = (e) => {
      this.onClick(e)
    }

  }

  onMouseenter(e:MouseEvent) {
    this.player.emit("progress-mouseenter",e,this);
  }

  onMouseleave(e:MouseEvent) {
    this.player.emit("progress-mouseleave",e,this);
  }

  onClick(e:MouseEvent) {
    this.player.emit("progress-click",e,this);
  }
}
