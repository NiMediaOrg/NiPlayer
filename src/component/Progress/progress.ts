import { Component } from "../../class/Component";
import { Player } from "../../page/player";
import { ComponentItem } from "../../types/Player";
import { Dot } from "./parts/Dot";
import { CompletedProgress } from "./parts/CompletedProgress";
import { BufferedProgress } from "./parts/BufferedProgress";
import { storeControlComponent } from "../../utils/store";
import { EVENT } from "../../events";

export class Progress extends Component implements ComponentItem {
  readonly id = "Progress";
  player: Player;
  dot: Dot;
  completedProgress: CompletedProgress;
  bufferedProgress: BufferedProgress;
  constructor(
    player: Player,
    container: HTMLElement,
    desc?: string,
  ) {
    super(container, desc);
    this.player = player;
    this.init();
  }

  init() {
    this.initComponent();
    this.initEvent();

    storeControlComponent(this);
  }

  initComponent() {
    this.dot = new Dot(this, this.player, this.el);
    this.completedProgress = new CompletedProgress(
      this.player,
      this.el,
      "div.completed-progress"
    );
    this.bufferedProgress = new BufferedProgress(
      this.player,
      this.el,
      "div.buffered-progress"
    );
  }

  initEvent() {
    this.el.onmouseenter = (e: Event) => {
      this.player.emit(EVENT.PROGRESS_MOUSE_ENTER, e, this);
      this.emit(EVENT.PROGRESS_MOUSE_ENTER, e, this)
    };

    this.el.onmouseleave = (e: Event) => {
      this.player.emit(EVENT.PROGRESS_MOUSE_LEAVE, e, this);
      this.emit(EVENT.PROGRESS_MOUSE_LEAVE,e, this);
    };

    this.el.onclick = (e: Event) => {
      this.player.emit(EVENT.PROGRESS_CLICK, e, this);
      this.emit(EVENT.PROGRESS_CLICK ,e, this)
    };
  }
}
