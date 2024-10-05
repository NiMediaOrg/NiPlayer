import { imageshot } from "@/assets/svg";
import { UIPlugin } from "@/base/ui.plugin";
import Utils from "@/shared/utils";
import { JSX } from "solid-js";

export class ImageShot extends UIPlugin {
    protected name: string = 'image-shot';


    protected render(): JSX.Element | string | HTMLElement {
        const handleClick = () => {
            const url = Utils.shot(this.player.nodes.videoElement);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${this.player.config.shot.filename ?? `Niplayer_${Date.now()}`}.png`;
            a.click();
        }
        return (
            <div class="niplayer-controller-middle-item niplayer-imageshot-container" onClick={handleClick}>
                <div innerHTML={imageshot} style={{width: '70%', height: '70%'}}></div>
                <span class="niplayer-controller-middle-item-tip">截图</span>
            </div>
        )
    }

    protected afterRender(): void {
        this.player.nodes.controllerBarMiddleRight.append(this.element);
    }
}