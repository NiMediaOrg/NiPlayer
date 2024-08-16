import { imageshot } from "@/assets/svg";
import { UIPlugin } from "@/base/ui.plugin";
import { JSX } from "solid-js";

export class ImageShot extends UIPlugin {
    protected name: string = 'image-shot';

    protected shot() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('your browser don not support canvas');
    }

    protected render(): JSX.Element | string | HTMLElement {
        const handleClick = () => {
            console.log('video shot')
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