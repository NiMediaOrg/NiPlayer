import { Component } from "@/class/Component";
import { Player } from "@/page/player";
import { ComponentItem } from "@/types/Player";
import { addClass, storeControlComponent } from "@/utils";
import { ContextMenuItem } from "./ContextMenuItem";

import pkg from "../../../package.json"
// 右击菜单部分
export class ContextMenu extends Component implements ComponentItem {
  readonly id = "ContextMenu";
  private player: Player;
  constructor(player: Player, container?: HTMLElement, desc?: string) {
    super(container, desc);
    this.player = player;
    this.init();
  }

  init(): void {
    this.initTemplate();
    this.initComponent();
    storeControlComponent(this);
  }

  initTemplate(): void {
    addClass(this.el, ["video-context-menu"]);
  }

  // 初始化基础的菜单选项
  initComponent() {
    this.registerContextMenu("统计信息", function(item: ComponentItem) {
        
    });
    this.registerContextMenu(`NiPlayer ${pkg.version}`)
    this.registerContextMenu("关闭",function(item: ContextMenuItem) {
        this.el.style.display = "";
    })
  }

   // 注册右击菜单选项
  registerContextMenu(
    content: string | HTMLElement,
    click?: (item: ContextMenuItem, e?: Event) => any
  ) {
    let item = new ContextMenuItem(this.el, content);
    item.el.addEventListener("click",(e: MouseEvent) => {
        e.stopPropagation();
        click.call(this, item, e)
    })
  }
}
