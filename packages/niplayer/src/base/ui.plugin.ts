import BasePlugin from "./base.plugin";
import { render } from "solid-js/web";
import type { JSX } from "solid-js/jsx-runtime";;
import NiPlayer from "@/player";
import { NI_PLAYER_EVENT } from "@/events";
/**
 * @instance UI类型的插件
 */
export abstract class UIPlugin extends BasePlugin {
    
    protected element: HTMLElement;

    constructor(player: NiPlayer) {
        super(player);
        this.player.on(NI_PLAYER_EVENT.MOUNTED, () => {
            this.afterRender();
        })
    }

    protected install(): void {
        const dom = this.render();
        this.element = document.createElement('div');
        if (typeof dom === 'string') {
            const domParser = new DOMParser();
            this.element = domParser.parseFromString(dom as string, 'text/html').children[0] as HTMLElement;
        } else if (dom instanceof HTMLElement) {
            this.element = dom;
        } else  {
            render(() => dom, this.element);
            this.element = this.element.children[0] as HTMLElement;
        }
    }
    /**
     * @desc 在ui类型的插件中，render函数用于实现视图
     */
    protected abstract render(): JSX.Element | string | HTMLElement;
    /**
     * @desc UI插件的视图渲染完成后的声明周期hooks
     */
    protected afterRender(): void {};
}