import { Node } from "../../types/Player";
import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem, DOMProps } from "../../types/Player";
import { Dot } from "./parts/Dot";
import { CompletedProgress } from "./parts/CompletedProgress";
import { BufferedProgress } from "./parts/BufferedProgress";
import { storeControlComponent } from "../../utils/store";
import { EVENT } from "../../events";
import "./progress.less";

export class Progress extends Component implements ComponentItem {
  readonly id = "Progress";
  props: DOMProps;
  player: Player;
  dot: Dot;
  completedProgress: CompletedProgress;
  bufferedProgress: BufferedProgress;
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
    props?: DOMProps,
    children?: Node[]
  ) {
    super(container, desc, props, children);
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
    this.dot = new Dot(this.player, this.el, "div");
    this.completedProgress = new CompletedProgress(
      this.player,
      this.el,
      "div.video-completed"
    );
    this.bufferedProgress = new BufferedProgress(
      this.player,
      this.el,
      "div.video-buffered"
    );
  }

  initEvent() {
    this.el.onmouseenter = (e: Event) => {
      this.player.emit(EVENT.VIDEO_PROGRESS_MOUSE_ENTER, e, this);
    };

    this.el.onmouseleave = (e: Event) => {
      this.player.emit(EVENT.VIDEO_PROGRESS_MOUSE_LEAVE, e, this);
    };

    this.el.onclick = (e: Event) => {
      this.player.emit(EVENT.VIDEO_PROGRESS_CLICK, e, this);
    };
  }
}
