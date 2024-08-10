import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js/jsx-runtime";
import "./index.less";
import { volume } from "@/assets/svg";

export class Volume extends UIPlugin {
    protected name: string = 'volume';

    protected render(): JSX.Element | string | HTMLElement {
        return (
            <div class="niplayer-controller-middle-item niplayer-controller-volume-container">
                <div innerHTML={volume} style={{width: '100%', height: '100%'}}></div>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleLeft.append(this.element);
    }
}