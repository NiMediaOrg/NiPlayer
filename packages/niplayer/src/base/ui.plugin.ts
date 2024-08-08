import BasePlugin from "./base.plugin";
import { render } from "solid-js/web";
import type { JSX } from "solid-js/jsx-runtime";
/**
 * @instance UI类型的插件
 */
export abstract class UIPlugin extends BasePlugin {
    protected abstract name: string;
    protected install(): void {
        if (DEBUG) {
            console.log(`[Plugin] The Plugin ${this.name} has installed`);
        }

        const element = this.render();
        render(() => element, this.player.config.container);
        console.log(element)
    }
    /**
     * @desc 在ui类型的插件中，render函数用于实现视图
     */
    protected abstract render(): JSX.Element;
}